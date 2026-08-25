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

export const formatJstDatetime = (value: string | Date): string => {
  return dayjs(value).tz("Asia/Tokyo").format("YYYY-MM-DDTHH:mm:ssZZ");
};

export const getPrevious24HoursRange = (reportAt: string): { from: string; to: string } => {
  const to = dayjs(reportAt).tz("Asia/Tokyo");
  return {
    from: to.subtract(24, "hour").format("YYYY-MM-DDTHH:mm:ssZZ"),
    to: to.format("YYYY-MM-DDTHH:mm:ssZZ"),
  };
};
