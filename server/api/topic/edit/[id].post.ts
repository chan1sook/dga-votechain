import dayjs from "dayjs";

import UserModel from "~~/server/models/user"
import TopicModel from "~~/server/models/topic"
import TopicPauseModel from "~~/server/models/topic-pause"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicNotificationData from "~~/server/models/topic-notifications"
import { isTopicFormValid, isTopicReadyToVote } from "~~/src/utils/topic";
import { checkPermissionSelections } from "~~/src/utils/permissions";
import mongoose, { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData || !checkPermissionSelections(userData.permissions, "change-topic")) {
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

  if(topicDoc.admin.toString() !== userData._id.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const pauseData = await TopicPauseModel.find({ topicid: topicDoc._id });
  if(pauseData.every((ele) => ele.resumeAt) && dayjs().diff(topicDoc.voteExpiredAt) > 0) {
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
  
    if(topicFormData.choices !== undefined) {
      topicDoc.choices = topicFormData.choices;
    }
    
    if(topicFormData.status !== undefined) {
      topicDoc.status = topicFormData.status;
    }
  
    if(topicFormData.durationMode !== undefined) {
      topicDoc.durationMode =topicFormData.durationMode;
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
  
    if(topicFormData.showScores !== undefined) {
      topicDoc.showScores = topicFormData.showScores;
    }
  
    if(topicFormData.showVotersChoicesPublic !== undefined) {
      topicDoc.showVotersChoicesPublic = topicFormData.showVotersChoicesPublic;
    }
  
    if(topicFormData.recoredToBlockchain !== undefined) {
      topicDoc.recoredToBlockchain = topicFormData.recoredToBlockchain;
    }
    
    if(topicFormData.voterAllows !== undefined) {
      await TopicVoterAllowsModel.deleteMany({ topicid: topicDoc._id })
      const voterAllows : Array<TopicVoterAllowData> = topicFormData.voterAllows.map((ele) => {
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

  await TopicNotificationData.deleteMany({ topicid: topicDoc._id });
  if(topicFormData.notifyVoter) {
    const topicNotifications : Array<TopicNotificationData> = [];
    for(const voteAllow of voterAllowDocs) {
      if(voteAllow.userid) {
        topicNotifications.push({
          userid: voteAllow.userid,
          topicid: topicDoc._id,
          createdAt: today,
          updatedAt: today,
          notifyAt: topicDoc.voteStartAt,
        })
      }
    }
    
    await TopicNotificationData.insertMany(topicNotifications);
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