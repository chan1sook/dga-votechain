import dayjs from "dayjs";

export const webAppName : string = "DGA E-Votechain";

export function toFirstCapitalState(state: string) {
  const leader = state.charAt(0).toUpperCase()
  const sub = state.substring(1).toLowerCase()
  return leader + sub;
}

export function formatDateTime(datetimeString: DateString) {
  return dayjs(datetimeString).format("YYYY-MM-DD HH:MM");
}

export function goBack() {
  useRouter().go(-1);
}