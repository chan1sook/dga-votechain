import dayjs from "dayjs";

import NotificationModel from "~~/server/models/notification"
import { getNtpTime } from "~~/server/ntp";
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const userData = event.context.userData;
  if(!userData || !checkPermissionNeeds(userData.permissions, "access-notifications")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  const docs = await NotificationModel.find({
    "target.read": { $exists: false },
    "target.citizenId": userData.digitalIdUserInfo.citizen_id,
  });

  const today = await getNtpTime();

  for(const doc of docs) {
    doc.target = doc.target.map((ele) => {
      if(ele.citizenId === userData.digitalIdUserInfo.citizen_id) {
        return {
          ...ele,
          read: today,
        }
      }
      return ele;
    })
  }
  await NotificationModel.bulkSave(docs);

  const notifications = docs.map<NotificationUserResponseData>((notification, i) => {
    const target = notification.target.find((ele) => ele.citizenId === userData.digitalIdUserInfo.citizen_id);
    return {
      _id: `${notification._id}`,
      from: notification.from,
      title: notification.title,
      content: notification.content,
      createdAt: dayjs(notification.createdAt).toISOString(),
      notifyAt: dayjs(notification.notifyAt).toISOString(),
      read: target && target.read ? dayjs(target.read).toISOString() : undefined,
      tags: notification.tags,
    }
  })
  
  return {
    notifications,
  }
})