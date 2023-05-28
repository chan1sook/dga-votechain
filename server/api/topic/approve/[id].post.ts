import dayjs from "dayjs";

import TopicModel from "~~/server/models/topic"
import TopicVoterAllowsModel from "~~/server/models/topic-voters-allow"
import TopicPauseModel from "~~/server/models/topic-pause"
import TopicNotificationData from "~~/server/models/topic-notifications"

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
  
  const { approve }: { approve: boolean } = await readBody(event);
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

  const pauseData = await TopicPauseModel.find({ topicid: topicDoc._id });
  if(pauseData.every((ele) => ele.resumeAt) && dayjs().diff(topicDoc.voteExpiredAt) > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Topic Expired",
    });
  }
  
  topicDoc.updatedBy = userData._id;
  topicDoc.status = approve ? "approved" : "rejected";
  topicDoc.admin = userData._id;
  topicDoc.updatedAt = today;

  if(dayjs().diff(topicDoc.voteStartAt) > 0) {
    const diff = dayjs().diff(topicDoc.voteStartAt);
    topicDoc.voteStartAt = dayjs().add(1, "hours").toDate();
    topicDoc.voteExpiredAt = dayjs(topicDoc.voteStartAt).add(diff).toDate();
  }

  if(topicDoc.notifyVoter &&  topicDoc.status === "approved") {
    const voterAllows : Array<TopicVoterAllowData> = await TopicVoterAllowsModel.find({ topicid: topicDoc._id });
    const topicNotifications : Array<TopicNotificationData> = voterAllows.map((ele) => {
      return {
        userid: new Types.ObjectId(ele.userid),
        topicid: topicDoc._id,
        createdAt: today,
        updatedAt: today,
        notifyAt: topicDoc.voteStartAt,
      }
    });
    await TopicNotificationData.insertMany(topicNotifications);
  }

  await topicDoc.save();
  await topicDoc.populate("createdBy");

  await dbSession.commitTransaction();
  await dbSession.endSession();
  
  return {
    status: "OK",
  }
})