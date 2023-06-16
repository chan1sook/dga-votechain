import dayjs from "dayjs";

import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import TopicVoterAllowsModel from "~/src/models/voters-allow"
import NotificationModel from "~/src/models/notification";
import mongoose, { Types } from "mongoose";
import { isTopicFormValid, isTopicReadyToVote } from "~/src/services/validations/topic";
import { isTopicPause } from "~/src/services/fetch/topic-ctrl-pause";
import { checkPermissionSelections } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData || isBannedUser(userData) || !checkPermissionSelections(userData.permissions, "change-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const topicFormData: Partial<TopicFormEditBodyData>  = await readBody(event);
  const today = new Date();

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const topicDoc = await TopicModel.findById(event.context.params?.id);
  if(!topicDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic not found",
    });
  }

  const admins = topicDoc.coadmins.slice()
  admins.push(topicDoc.admin);

  if(admins.findIndex((ele) => ele.toString() === userData._id.toString()) === -1) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const topicPauseFlag = await isTopicPause(topicDoc._id);
  if(!topicPauseFlag && dayjs().diff(topicDoc.voteExpiredAt) > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic Expired",
    });
  }
  
  const isTopicVoting = isTopicReadyToVote(topicDoc);

  topicDoc.updatedBy = userData._id;
  topicDoc.updatedAt = today;

  if(!isTopicVoting) {
    if(topicFormData.name !== undefined) {
      topicDoc.name = topicFormData.name;
    }
  
    if(topicFormData.description !== undefined) {
      topicDoc.description = topicFormData.description;
    }
  
    if(topicFormData.multipleVotes !== undefined) {
      topicDoc.multipleVotes = topicFormData.multipleVotes;
    }

    if(topicFormData.distinctVotes !== undefined) {
      topicDoc.distinctVotes = topicFormData.distinctVotes;
    }
    
    if(topicFormData.choices !== undefined) {
      topicDoc.choices = topicFormData.choices;
    }
    
    if(topicFormData.status !== undefined) {
      topicDoc.status = topicFormData.status;
    }
  
    if(topicFormData.durationMode !== undefined) {
      topicDoc.durationMode = topicFormData.durationMode;
    }
  
    if(topicFormData.voteStartAt !== undefined) {
      topicDoc.voteStartAt = dayjs(topicFormData.voteStartAt).toDate();
    }
    
    if(topicFormData.voteExpiredAt !== undefined) {
      topicDoc.voteExpiredAt = dayjs(topicFormData.voteExpiredAt).toDate();
    }
  
    if(topicFormData.publicVote !== undefined) {
      topicDoc.publicVote = topicFormData.publicVote;
    }

    if(topicFormData.anonymousVotes !== undefined) {
      topicDoc.anonymousVotes = topicFormData.anonymousVotes;
    }

    if(topicFormData.recoredToBlockchain !== undefined) {
      topicDoc.recoredToBlockchain = topicFormData.recoredToBlockchain;
    }

    if(topicFormData.defaultVotes !== undefined) {
      topicDoc.defaultVotes = topicFormData.defaultVotes;
    }
    
    if(topicFormData.voterAllows !== undefined) {
      await TopicVoterAllowsModel.deleteMany({ topicid: topicDoc._id })
      const voterAllows : VoterAllowModelData[] = topicFormData.voterAllows.map((ele) => {
        return {
          topicid: topicDoc._id,
          userid: new Types.ObjectId(ele.userid),
          totalVotes: ele.totalVotes,
          remainVotes: ele.totalVotes,
        }
      });
      await TopicVoterAllowsModel.insertMany(voterAllows);
    }
  }

  if(topicFormData.coadmins !== undefined) {
    const coadminsDocs = await UserModel.find({
      $and: [
        { _id: { $ne: userData._id } },
        { _id: { $in: topicFormData.coadmins.map((ele) => new Types.ObjectId(ele)) }}
      ]
    })

    topicDoc.coadmins = coadminsDocs.map((ele) => ele._id);
  }

  const voterAllowDocs = await TopicVoterAllowsModel.find({ topicid: topicDoc._id });

  await NotificationModel.deleteMany({ 
    group: "topic",
    "extra.id": topicDoc._id.toString(),
   });

  if(topicFormData.notifyVoter) {
    const notifications : NotificationModelData[] = [];
    for(const voteAllow of voterAllowDocs) {
      notifications.push({
        userid: new Types.ObjectId(voteAllow.userid),
        group: "topic",
        extra: {
          id: topicDoc._id.toString(),
          name: topicDoc.name,
          status: "voting",
        },
        notifyAt: topicDoc.voteStartAt,
      })
    }
    
    await NotificationModel.insertMany(notifications);
  }
  
  if(!isTopicFormValid({
    ...topicDoc.toJSON(),
    voterAllows: voterAllowDocs.map((ele) => {
      return {
        userid: `${ele.userid}`,
        totalVotes: ele.totalVotes,
      }
    })
  })) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  await topicDoc.save();

  await dbSession.commitTransaction();
  await dbSession.endSession();

  return {
    status: "OK",
  }
})