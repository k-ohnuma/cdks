import { ProblemDifficulty } from "./problem-difficulty";

export interface ProblemDifficultyRepository {
  findById(problemId: string): Promise<ProblemDifficulty | undefined>;
  save(problemDifficulty: ProblemDifficulty): Promise<void>;
}
