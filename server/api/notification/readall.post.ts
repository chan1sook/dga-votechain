import mongoose from "mongoose";

import NotificationModel from "~/src/models/notification"
import { clearNotifyData } from "~/server/notify-storage";

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

  const notificationDocs = await NotificationModel.find({
    userid: userData._id,
    readAt: { $exists: false },
  });

  for(const doc of notificationDocs) {
    doc.readAt = new Date();
  }

  await NotificationModel.bulkSave(notificationDocs);
  
  await dbSession.commitTransaction();
  await dbSession.endSession();

  clearNotifyData(userData._id.toString());

  const counts = notificationDocs.length;
  
  return {
    counts,
  }
})