import dayjs from "dayjs";

import UserModel from "~/src/models/user"
import TopicModel from "~/src/models/topic"
import TopicVoterAllowsModel from "~/src/models/voters-allow"
import NotificationModel from "~/src/models/notification";
import mongoose, { Types } from "mongoose";
import { isTopicFormValid } from "~/src/services/validations/topic";
import { checkPermissionNeeds } from "~/src/services/validations/permission";
import { isBannedUser } from "~/src/services/validations/user";
import { isUserAdmin } from "~/src/services/validations/role";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  
  if(!userData || isBannedUser(userData) || !isUserAdmin(userData) || !checkPermissionNeeds(userData.permissions, "create-topic")) {
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
    type: topicFormData.type,
    internalFilter: topicFormData.internalFilter,
    multipleVotes: topicFormData.multipleVotes,
    distinctVotes: topicFormData.distinctVotes,
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
    anonymousVotes: topicFormData.anonymousVotes,
    showCreator: topicFormData.showCreator,
    recoredToBlockchain: topicFormData.recoredToBlockchain,
    notifyVoter: topicFormData.notifyVoter,
    defaultVotes: topicFormData.defaultVotes,
  });
  
  const voterAllows : VoterAllowModelData[] = topicFormData.voterAllows.map((ele) => {
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
    const notifications : NotificationModelData[] = topicFormData.voterAllows.map((ele) => {
      return {
        userid: new Types.ObjectId(ele.userid),
        group: "topic",
        extra: {
          id: newTopicDoc._id.toString(),
          name: newTopicDoc.name,
          status: "voting",
        },
        notifyAt: newTopicDoc.voteStartAt,
      }
    });
    await NotificationModel.insertMany(notifications);
  }

  await dbSession.commitTransaction();
  await dbSession.endSession();

  return {
    status: "OK",
  }
})