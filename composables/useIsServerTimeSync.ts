export const useIsServerTimeSync = (SYNCTIME_THERSOLD : number = 60000) => {
  return useState<boolean>('isServerTimeSync', () => {
    const syncTimeData = useSyncTimeData().value;
    const diff = Date.now() - syncTimeData.lastestSyncLocal.getTime();
    return syncTimeData.synced && Math.abs(diff) <= SYNCTIME_THERSOLD;
  })
}