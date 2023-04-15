import mongoose from "mongoose";

import NotificationModel from "~~/server/models/notification"
import TopicNotificationModel from "~~/server/models/topic-notifications"
import { clearNotifyData } from "~~/server/notify-storage";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  const [notiDocs, topicNotiDocs] = await Promise.all([
    NotificationModel.find({
      "target.userid": userData._id,
      "target.readAt": { $exists: false },
    }),
    TopicNotificationModel.find({
      userid: userData._id,
      readAt: { $exists: false },
    }),
  ]);

  const today = new Date();

  for(const doc of notiDocs) {
    doc.target = doc.target.map((ele) => {
      if(ele.userid.toString() === userData._id.toString()) {
        return {
          ...ele,
          readAt: today,
        }
      }
      return ele;
    })
  }for(const doc of topicNotiDocs) {
    doc.readAt = today;
  }

  await Promise.all([
    NotificationModel.bulkSave(notiDocs),
    TopicNotificationModel.bulkSave(topicNotiDocs),
  ]);

  await dbSession.commitTransaction();
  await dbSession.endSession();

  clearNotifyData(userData._id.toString());

  const counts = notiDocs.length + topicNotiDocs.length;
  
  return {
    counts,
  }
})