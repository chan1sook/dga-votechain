import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
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
  } else if(!isTopicReadyToVote(topicDoc)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic not editable",
    });
  }
  topicDoc.updatedBy = userData._id;
  topicDoc.updatedAt = today;

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

  const voterAllowDocs = await TopicVoterAllowsModel.find({ topicid: topicDoc._id });

  await TopicNotificationData.deleteMany({ topicid: topicDoc._id });
  if(topicFormData.notifyVoter) {
    const topicNotifications : Array<TopicNotificationData> = voterAllowDocs.map((ele) => {
      return {
        userid: ele.userid,
        topicid: topicDoc._id,
        createdAt: today,
        updatedAt: today,
        notifyAt: topicDoc.voteStartAt,
      }
    });
    await TopicNotificationData.insertMany(topicNotifications);
  }
  
  if(!isTopicFormValid({
    ...topicDoc.toJSON(),
    voterAllows: voterAllowDocs.map((ele) => {
      return {
        userid: ele.userid.toString(),
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
  
  const topic : TopicResponseData = {
    _id: topicDoc._id.toString(),
    status: topicDoc.status,
    name: topicDoc.name,
    description: topicDoc.description,
    multipleVotes: topicDoc.multipleVotes,
    choices: topicDoc.choices,
    voteStartAt: dayjs(topicDoc.voteStartAt).toISOString(),
    voteExpiredAt: dayjs(topicDoc.voteExpiredAt).toISOString(),
    createdAt: dayjs(topicDoc.createdAt).toISOString(),
    updatedAt: dayjs(topicDoc.updatedAt).toISOString(),
    createdBy: topicDoc.createdBy && !(topicDoc.createdBy instanceof Types.ObjectId) ? {
      _id: topicDoc.createdBy._id,
      firstName: topicDoc.createdBy.firstName,
      lastName: topicDoc.createdBy.lastName,
      email: topicDoc.createdBy.email,
    } : undefined,
    updatedBy: topicDoc.updatedBy && !(topicDoc.updatedBy instanceof Types.ObjectId) ? {
      _id: topicDoc.updatedBy._id,
      firstName: topicDoc.updatedBy.firstName,
      lastName: topicDoc.updatedBy.lastName,
      email: topicDoc.updatedBy.email,
    } : undefined,
    publicVote: topicDoc.publicVote,
    showScores: topicDoc.showScores,
    showVotersChoicesPublic: topicDoc.showVotersChoicesPublic,
    recoredToBlockchain: topicDoc.recoredToBlockchain,
    notifyVoter: topicDoc.notifyVoter,
  };

  return {
    topic,
  }
})