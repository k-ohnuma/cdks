import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export const getCurrentEpochSec = (type: "milli" | "sec"): number => {
  return type === "sec" ? dayjs().unix() : dayjs().valueOf();
};

export const getCurrentDatetime = (): string => {
  return dayjs().tz("Asia/Tokyo").format("YYYY-MM-DDTHH:mm:ssZ");
};
