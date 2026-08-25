export const PROBLEM_DIFFICULTIES = ["hai", "cha", "midori", "mizu", "ao", "ki", "dai", "aka"] as const;

export type ProblemDifficulty = (typeof PROBLEM_DIFFICULTIES)[number];

export type ContestSummary = {
  id: string;
  title: string;
};

export type CreateVirtualContestInput = {
  title: string;
  memo: string;
  startEpochSecond: number;
  durationSecond: number;
  isPublic: boolean;
  problemDifficulties: ProblemDifficulty[];
};

export type CreatedVirtualContest = {
  id: string;
  url: string;
};
