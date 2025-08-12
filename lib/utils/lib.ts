import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

export const getResponse = (response: Record<string, any>, statusCode?: number) => {
  return {
    statusCode: statusCode ?? 200,
    body: JSON.stringify(response),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

export const getCurrentEpochSec = (type: "milli" | "sec"): number => {
  return type === "sec" ? dayjs().unix() : dayjs().valueOf();
};

export const getCurrentDatetime = (): string => {
  return dayjs().tz("Asia/Tokyo").format("YYYY-MM-DDTHH:mm:ssZ");
};
