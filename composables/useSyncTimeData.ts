export const useSyncTimeData = () => {
  return useState<BrowserTimeSyncData>('syncTimeData', () => {
    return {
      synced: false,
      lastestSyncLocal: new Date(),
      time: new Date(),
    }
  })
}