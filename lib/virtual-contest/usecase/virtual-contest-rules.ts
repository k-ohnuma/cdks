import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { ProblemDifficulty } from "./models/virtual-contest";

dayjs.extend(utc);
dayjs.extend(timezone);

const difficultyLabels: Record<ProblemDifficulty, string> = {
  hai: "灰",
  cha: "茶",
  midori: "緑",
  mizu: "水",
  ao: "青",
  ki: "黄",
  dai: "橙",
  aka: "赤",
};

export const getProblemDifficultyLabel = (difficulty: ProblemDifficulty): string => difficultyLabels[difficulty];

export const get21JstEpoch = (nowEpochSecond: number): number => {
  const now = dayjs.unix(nowEpochSecond).tz("Asia/Tokyo");
  return now.hour(21).minute(0).second(0).millisecond(0).unix();
};
