export type ProblemDifficultyCandidate = {
  problemId: string;
  sourceDifficulty?: number;
};

export interface ProblemDifficultySource {
  fetchAll(): Promise<ProblemDifficultyCandidate[]>;
}
