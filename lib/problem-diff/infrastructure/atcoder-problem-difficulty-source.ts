import { AtcoderProblemsClient } from "../../clients/atcoder-problems-client";
import { ProblemDifficultyCandidate, ProblemDifficultySource } from "../usecase/ports/problem-difficulty-source";

export class AtCoderProblemDifficultySource implements ProblemDifficultySource {
  constructor(private readonly client: AtcoderProblemsClient) {}

  async fetchAll(): Promise<ProblemDifficultyCandidate[]> {
    const models = await this.client.getProblemsModelJson();
    return Object.entries(models).map(([problemId, model]) => ({
      problemId,
      sourceDifficulty: model.difficulty,
    }));
  }
}
