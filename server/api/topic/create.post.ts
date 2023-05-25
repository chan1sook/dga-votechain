import dayjs from "dayjs";

import UserModel from "~~/server/models/user"
import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicNotificationData from "~~/server/models/topic-notifications"
import { isTopicFormValid } from "~~/src/utils/topic";
import { checkPermissionNeeds } from "~~/src/utils/permissions";
import mongoose, { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  
  if(!userData || !checkPermissionNeeds(userData.permissions, "create-topic")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const topicFormData: TopicFormBodyData = await readBody(event);
  if(!isTopicFormValid(topicFormData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Input Invalid",
    });
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();
  
  const today = new Date();

  const coadminsDocs = await UserModel.find({
    $and: [
      { _id: { $ne: userData._id } },
      { _id: { $in: topicFormData.coadmins.map((ele) => new Types.ObjectId(ele)) }}
    ]
  })

  const newTopicDoc = new TopicModel({
    name: topicFormData.name,
    description: topicFormData.description,
    choices: topicFormData.choices,
    status: "approved",
    createdBy: userData._id,
    updatedBy: userData._id,
    createdAt: today,
    updatedAt: today,
    admin: userData._id,
    coadmins: coadminsDocs.map((ele) => ele._id),
    durationMode: topicFormData.durationMode,
    voteStartAt: dayjs(topicFormData.voteStartAt).toDate(),
    voteExpiredAt: dayjs(topicFormData.voteExpiredAt).toDate(),
    publicVote: topicFormData.publicVote,
    showScores: topicFormData.showScores,
    showVotersChoicesPublic: topicFormData.showVotersChoicesPublic,
    recoredToBlockchain: topicFormData.recoredToBlockchain,
    notifyVoter: topicFormData.notifyVoter,
    multipleVotes: topicFormData.multipleVotes,
  });
  
  const voterAllows : Array<TopicVoterAllowData> = topicFormData.voterAllows.map((ele) => {
    return {
      topicid: newTopicDoc._id,
      userid: new Types.ObjectId(ele.userid),
      totalVotes: ele.totalVotes,
      remainVotes: ele.totalVotes,
    }
  });

  await Promise.all([
    newTopicDoc.save(),
    TopicVoterAllowsModel.insertMany(voterAllows),
  ]);

  if(topicFormData.notifyVoter) {
    const topicNotifications : Array<TopicNotificationData> = topicFormData.voterAllows.map((ele) => {
      return {
        userid: new Types.ObjectId(ele.userid),
        topicid: newTopicDoc._id,
        createdAt: today,
        updatedAt: today,
        notifyAt: newTopicDoc.voteStartAt,
      }
    });
    await TopicNotificationData.insertMany(topicNotifications);
  }

  await dbSession.commitTransaction();
  await dbSession.endSession();

  return {
    status: "OK",
  }
})