import dayjs from "dayjs";

export const useComputedServerTime = () => {
  const syncTimeData = useSyncTimeData().value;
  const diff = Date.now() - syncTimeData.lastestSyncLocal.getTime();
  return dayjs(syncTimeData.time).add(diff).toDate();
}