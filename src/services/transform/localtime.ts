import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export function thaiLocalTimeToGMT(
  year: number,
  month: number,
  date?: number,
  hour?: number,
  minute?: number,
  second?: number,
  millisecond?: number
) {
  return dayjs()
    .tz("Asia/Bangkok")
    .year(year)
    .month(month)
    .date(date || 1)
    .hour(hour || 0)
    .minute(minute || 0)
    .second(second || 0)
    .millisecond(millisecond || 0)
    .toDate();
}
