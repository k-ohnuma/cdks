import { setTimeout } from "node:timers/promises";
import { calculateProblemDifficulty } from "../domain/problem-difficulty";
import { ProblemDifficultyRepository } from "../domain/problem-difficulty-repository";
import { ProblemDifficultySource } from "./ports/problem-difficulty-source";

type SyncProblemDifficultiesOptions = {
  concurrency?: number;
  writeIntervalMs?: number;
};

export type SyncProblemDifficultiesOutput = {
  savedCount: number;
  skippedCount: number;
};

export class SyncProblemDifficulties {
  private readonly concurrency: number;
  private readonly writeIntervalMs: number;

  constructor(
    private readonly repository: ProblemDifficultyRepository,
    private readonly source: ProblemDifficultySource,
    { concurrency = 15, writeIntervalMs = 500 }: SyncProblemDifficultiesOptions = {},
  ) {
    this.concurrency = concurrency;
    this.writeIntervalMs = writeIntervalMs;
  }

  async execute(): Promise<SyncProblemDifficultiesOutput> {
    const candidates = await this.source.fetchAll();
    const targets = candidates.filter(
      (candidate): candidate is { problemId: string; sourceDifficulty: number } =>
        candidate.sourceDifficulty !== undefined,
    );
    const queue = [...targets];
    const workers = Array.from({ length: Math.min(this.concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const candidate = queue.shift();
        if (candidate) {
          await this.repository.save({
            problemId: candidate.problemId,
            difficulty: calculateProblemDifficulty(candidate.sourceDifficulty),
          });
          if (this.writeIntervalMs > 0) await setTimeout(this.writeIntervalMs);
        }
      }
    });
    await Promise.all(workers);

    return {
      savedCount: targets.length,
      skippedCount: candidates.length - targets.length,
    };
  }
}
