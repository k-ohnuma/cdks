import { ProblemDifficultyRepository } from "../../lib/problem-diff/domain/problem-difficulty-repository";
import { ProblemDifficultySource } from "../../lib/problem-diff/usecase/ports/problem-difficulty-source";
import { SyncProblemDifficulties } from "../../lib/problem-diff/usecase/sync-problem-difficulties";

describe("SyncProblemDifficulties", () => {
  it("calculates and saves available difficulties", async () => {
    const repository: ProblemDifficultyRepository = {
      findById: jest.fn(),
      save: jest.fn(async () => {}),
    };
    const source: ProblemDifficultySource = {
      fetchAll: jest.fn(async () => [
        { problemId: "abc001_a", sourceDifficulty: 0 },
        { problemId: "abc001_b", sourceDifficulty: 800 },
        { problemId: "abc001_c" },
      ]),
    };
    const usecase = new SyncProblemDifficulties(repository, source, {
      concurrency: 2,
      writeIntervalMs: 0,
    });

    const output = await usecase.execute();

    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(repository.save).toHaveBeenCalledWith({ problemId: "abc001_a", difficulty: 147 });
    expect(repository.save).toHaveBeenCalledWith({ problemId: "abc001_b", difficulty: 800 });
    expect(output).toStrictEqual({ savedCount: 2, skippedCount: 1 });
  });
});
