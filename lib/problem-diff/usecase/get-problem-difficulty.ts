import { ProblemDifficulty } from "../domain/problem-difficulty";
import { ProblemDifficultyRepository } from "../domain/problem-difficulty-repository";

export interface GetProblemDifficultyInputPort {
  execute(problemId: string): Promise<ProblemDifficulty | undefined>;
}

export class GetProblemDifficulty implements GetProblemDifficultyInputPort {
  constructor(private readonly repository: ProblemDifficultyRepository) {}

  async execute(problemId: string): Promise<ProblemDifficulty | undefined> {
    return await this.repository.findById(problemId);
  }
}
