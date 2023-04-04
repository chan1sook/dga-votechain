import dayjs from "dayjs";

export function formatDateTime(datetimeString: DateString) {
  return dayjs(datetimeString).format("YYYY-MM-DD HH:MM");
}

export function perttyDurationDHM(duration: number, withDecimal?: boolean) {
  let mins = duration / (60 * 1000);
  if(mins >= 60) {
    let hr = mins / 60;
    if(hr >= 24) {
      let days = hr / 24;
      if(withDecimal) {
        return `${days.toFixed(2)} Days`;
      } else {
        const days2 = Math.ceil(days);
        return days2 === 1 ? `${days2} Day` : `${days2} Days`;
      }
    } else {
      if(withDecimal) {
        return `${hr.toFixed(2)} Hours`;
      } else {
        const hr2 = Math.ceil(hr);
        return hr2 === 1 ? `${hr2} Hour` : `${hr2} Hours`;
      }
    }
  } else {
    if(withDecimal) {
      return `${mins.toFixed(2)} Mins`;
    } else {
      const min2 = Math.ceil(mins);
      return min2 === 1 ? `${min2} Min` : `${min2} Mins`;
    }
  }
  
}

export function perttyDuration(duration: number, withDecimal?: boolean) {
  const secs = duration / 1000;
  const mins = secs / 60;
  const hours = mins / 60;
  const days = hours / 60;
  
  const secs2 = Math.floor(secs) % 60;
  const mins2 = Math.floor(mins) % 60;
  const hours2 = Math.floor(hours) % 24;
  const days2 = Math.floor(days);
  
  const secStr = secs2 < 10 ? `0${secs2}` : `${secs2}`;
  const minStr = mins2 < 10 ? `0${mins2}` : `${mins2}`;
  const hrStr = hours2 < 10 ? `0${hours2}` : `${hours2}`;
  return `${days2}:${hrStr}:${minStr}:${secStr}`;
}

export function getComputedServerTime() {
  const syncTimeData = useSyncTimeData().value;
  const diff = Date.now() - syncTimeData.lastestSyncLocal.getTime();
  return dayjs(syncTimeData.time).add(diff).toDate();
}

export function isServerTimeSync(SYNCTIME_THERSOLD = 60000) {
  const syncTimeData = useSyncTimeData().value;
  const diff = Date.now() - syncTimeData.lastestSyncLocal.getTime();
  return syncTimeData.synced && diff >= 0 && diff <= SYNCTIME_THERSOLD;
}
  