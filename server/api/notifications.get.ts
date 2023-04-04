import dayjs from "dayjs";

import NotificationModel from "~~/server/models/notification"
import { checkPermissionNeeds } from "~~/src/utils/permissions";

export default defineEventHandler(async (event) => {
  const { type, pagesize, startid } : NotificationQueryParams = getQuery(event);
  
  let notificationsData: Array<NotificationData> = [];

  const userData = event.context.userData;
  if(!userData || !checkPermissionNeeds(userData.permissions, "access-notifications")) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  switch(type) {
    case "unread":
      notificationsData = await NotificationModel.getLastestUnreadNotifications(userData.digitalIdUserInfo.citizen_id, pagesize, startid);
      break;
    case "read":
      notificationsData = await NotificationModel.getLastestReadNotifications(userData.digitalIdUserInfo.citizen_id, pagesize, startid);
      break;
    case "all":
    default:
      notificationsData = await NotificationModel.getLastestAllNotifications(userData.digitalIdUserInfo.citizen_id, pagesize, startid);
      break;
  }

  const notifications = notificationsData.map<NotificationUserResponseData>((notification, i) => {
    const target = notification.target.find((ele) => ele.citizenId === userData.digitalIdUserInfo.citizen_id);
    return {
      _id: `${notification._id}`,
      from: notification.from,
      title: notification.title,
      content: notification.content,
      createdAt: dayjs(notification.createdAt).toISOString(),
      notifyAt: dayjs(notification.notifyAt).toISOString(),
      tags: notification.tags,
      read: target && target.read ? dayjs(target.read).toISOString() : undefined,
    }
  })
  
  return {
    notifications,
  }
})