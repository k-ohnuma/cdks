import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Contest } from "./clients/atcoder-problems-client";
import { getCurrentEpochSec } from "./utils/lib";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getUpcomingTargetContests = (
  targetContestNames: string[],
  contests: Contest[],
  contestBaseUrl: string,
) => {
  return targetContestNames
    .map((title) => {
      const found = contests.find((c) => c.title === title);
      return found ? { title: found.title, url: `${contestBaseUrl}/${found.id}` } : null;
    })
    .filter((c): c is { title: string; url: string } => c !== null);
};

export const get21JSTEpoch = (): number => {
  const nowEpochSec = getCurrentEpochSec("sec");
  const now = dayjs.unix(nowEpochSec).tz("Asia/Tokyo");
  const target = now.hour(21).minute(0).second(0).millisecond(0);
  return target.unix();
};

export const charToKanji = (char: string): string => {
  switch (char) {
    case "hai":
      return "灰";
    case "cha":
      return "茶";
    case "midori":
      return "緑";
    case "mizu":
      return "水";
    case "ao":
      return "青";
    case "ki":
      return "黄";
    case "dai":
      return "橙";
    case "aka":
      return "赤";
    default:
      throw new Error(`unexpected char ${char}`);
  }
};
