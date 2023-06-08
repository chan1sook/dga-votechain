function getRequestPermissionHeaderNotification(data: NotificationRequestGroup) {
  const i18t = useI18n();

  const group = "request-permission"
  const header = `${i18t.t(`notification.${group}.title`)} #${data.extra.id} ${i18t.t(`notification.${group}.${data.extra.status}`)}`

  return header;
}

function getTopicHeaderNotification(data: NotificationTopicGroup) {
  const i18t = useI18n();

  const group = "topic"
  const header = `${i18t.t(`notification.${group}.title`)} "${data.extra.name}" ${i18t.t(`notification.${group}.${data.extra.status}`)}`

  return header;
}

export function formatNotificationHeader(notification: NotificationUserResponseData) {
  switch(notification.group) {
    case "request-permission":
      return getRequestPermissionHeaderNotification(notification);
    case "topic":
      return getTopicHeaderNotification(notification);      
  }
}