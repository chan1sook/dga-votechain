import dayjs from "dayjs";

export function configSerializationReplacer(value: any) : any {
  if(value && typeof value === "object") {
    if(value instanceof Date) {
      return dayjs(value).toISOString();
    } else {
      return JSON.stringify(value);
    }
  }

  return value;
}