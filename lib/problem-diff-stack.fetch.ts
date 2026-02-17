import { Handler } from "aws-lambda";
import { logger } from "./utils/logger";
import { AwsDynamoDBDocumentClient } from "./clients/dynamo-db-client";
import { ProblemDifficultyRepository } from "./repo/problem-diff-table";
import { z } from "zod";
import { AtcoderProblemsClient } from "./clients/atcoder-problems-client";
import pLimit from "p-limit";
import { setTimeout } from "timers/promises";

const envSchema = z
  .object({
    TABLE_NAME: z.string(),
    ACP_BASE_ENDPOINT: z.string(),
  })
  .transform((item) => {
    return {
      tableName: item.TABLE_NAME,
      acpBaseEndpoint: item.ACP_BASE_ENDPOINT,
    };
  });

const calcDifficulty = (diff: number): number => {
  if (diff >= 400) return diff;
  const base = (400 - diff) / 400;
  const r = Math.exp(base);
  return Math.round(400 / r);
};

const run = async (problemDiffRepo: ProblemDifficultyRepository, acpClient: AtcoderProblemsClient) => {
  const probModels = Object.entries(await acpClient.getProblemsModelJson());
  const limit = pLimit(15);

  await Promise.all(
    probModels.map((item) =>
      limit(async () => {
        const problemId = item[0];
        const sourceDiff = item[1].difficulty;
        if (sourceDiff === undefined) return;
        const difficulty = calcDifficulty(sourceDiff);
        await problemDiffRepo.put({ problemId, difficulty });
        await setTimeout(500);
      }),
    ),
  );
};

export const handler: Handler = async () => {
  const env = envSchema.parse(process.env);
  const dynamoDBClient = new AwsDynamoDBDocumentClient(logger);
  const problemDiffRepo = new ProblemDifficultyRepository(env.tableName, dynamoDBClient);
  const acpClient = new AtcoderProblemsClient(env.acpBaseEndpoint);
  await run(problemDiffRepo, acpClient);
};
