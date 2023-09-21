import dayjs from "dayjs";

export function formatDateTime(datetime: Date | DateString) {
  return dayjs(datetime).format("YYYY-MM-DD HH:mm");
}

export function perttyDuration(duration: number) {
  const secs = (duration >= 0 ? duration : 0) / 1000;
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
