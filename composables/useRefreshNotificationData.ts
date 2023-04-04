export const useRefreshNotificationData = () => {
  return useState<boolean>('refreshNotificationData', () => false);
}