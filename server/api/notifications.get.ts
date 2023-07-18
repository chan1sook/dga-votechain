import dayjs from "dayjs";

import { getNotificationByUser } from "~/src/services/fetch/notification";

export default defineEventHandler(async (event) => {
  const { pagesize, startid }: NotificationQueryParams = getQuery(event);

  const userData = event.context.userData;
  if (!userData) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  const notificationsData: NotificationModelDataWithId[] =
    await getNotificationByUser(userData._id, pagesize, startid);
  const notificationsResData =
    notificationsData.map<NotificationUserResponseData>((notification) => {
      return {
        _id: notification._id.toString(),
        group: notification.group,
        extra: notification.extra,
        notifyAt: dayjs(notification.notifyAt).toString(),
        readAt: notification.readAt
          ? dayjs(notification.readAt).toString()
          : undefined,
      };
    });

  return notificationsResData;
});
