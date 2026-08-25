export const PROBLEM_COLORS = ["aka", "dai", "ki", "ao", "mizu", "midori", "cha", "hai"] as const;

export type ProblemColor = (typeof PROBLEM_COLORS)[number];
export type ContestMode = "normal" | "training";

export type CreateContestFromRangeInput = {
  accessToken: string;
  start: number;
  end: number;
  colors: ProblemColor[];
  startEpochSecond: number;
  durationSecond: number;
  isPublic: boolean;
  title: string;
  mode: ContestMode;
};

export type CreatedContest = {
  id: string;
  url: string;
};
