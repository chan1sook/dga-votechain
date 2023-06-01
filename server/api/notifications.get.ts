import dayjs from "dayjs";

import NotificationModel from "~~/server/models/notification"
import TopicNotificationModel from "~~/server/models/topic-notifications"

export default defineEventHandler(async (event) => {
  const { type, pagesize, startid } : NotificationQueryParams = getQuery(event);
  
  let notificationsData: NotificationData[] = [];
  let topicNotificationsData: TopicNotificationDataWithPopulate[] = [];

  const userData = event.context.userData;
  if(!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }
  
  switch(type) {
    case "unread":
      [notificationsData, topicNotificationsData] = await Promise.all([
        NotificationModel.getLastestUnreadNotifications(userData._id, pagesize, startid),
        TopicNotificationModel.getLastestUnreadNotifications(userData._id, pagesize, startid)
      ]);
      break;
    case "read":
      [notificationsData, topicNotificationsData] = await Promise.all([
        NotificationModel.getLastestReadNotifications(userData._id, pagesize, startid),
        TopicNotificationModel.getLastestReadNotifications(userData._id, pagesize, startid)
      ]);
      break;
    case "all":
    default:
      [notificationsData, topicNotificationsData] = await Promise.all([
        NotificationModel.getLastestAllNotifications(userData._id, pagesize, startid),
        TopicNotificationModel.getLastestAllNotifications(userData._id, pagesize, startid)
      ]);
      break;
  }

  const _notiResData = notificationsData.map<NotificationUserResponseData>((notification, i) => {
    const target = notification.target.find((ele) => ele.userid.toString() === userData._id.toString());
    return {
      _id: `${notification._id}`,
      from: notification.from,
      title: notification.title,
      content: notification.content,
      createdAt: dayjs(notification.createdAt).toISOString(),
      notifyAt: dayjs(notification.notifyAt).toISOString(),
      tags: notification.tags,
      readAt: target && target.readAt ? dayjs(target.readAt).toISOString() : undefined,
    }
  })
  
  const _topicNotiResData = topicNotificationsData.map<NotificationUserResponseData>((notification, i) => {
    const topicName = notification.topicid ? notification.topicid.name : notification.topicid;
    const content = `{{notification.topicStart}} [${topicName}]`;
    return {
      _id: `${notification._id}`,
      from: "system",
      title: content,
      content: content,
      createdAt: dayjs(notification.createdAt).toISOString(),
      notifyAt: dayjs(notification.notifyAt).toISOString(),
      tags: [],
      readAt: notification.readAt ? dayjs(notification.readAt).toISOString() : undefined,
    }
  })
  let notifications = _notiResData.concat(_topicNotiResData);
  notifications.sort((a, b) => b._id.localeCompare(a._id))
  notifications = notifications.slice(0, pagesize || 50);
  
  return {
    notifications,
  }
})