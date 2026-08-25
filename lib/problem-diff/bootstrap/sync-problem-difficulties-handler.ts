import { Handler } from "aws-lambda";
import { AtcoderProblemsClient } from "../../clients/atcoder-problems-client";
import { logger } from "../../shared/logging/logger";
import { AtCoderProblemDifficultySource } from "../infrastructure/atcoder-problem-difficulty-source";
import { DynamoDbProblemDifficultyRepository } from "../infrastructure/dynamodb-problem-difficulty-repository";
import { SyncProblemDifficulties } from "../usecase/sync-problem-difficulties";
import { parseProblemDiffSyncConfig } from "./config";

const config = parseProblemDiffSyncConfig(process.env);
const repository = new DynamoDbProblemDifficultyRepository(config.tableName);
const source = new AtCoderProblemDifficultySource(new AtcoderProblemsClient(config.acpBaseEndpoint));
const usecase = new SyncProblemDifficulties(repository, source, {
  concurrency: config.writeConcurrency,
  writeIntervalMs: config.writeIntervalMs,
});

export const handler: Handler = async () => {
  try {
    return await usecase.execute();
  } catch (error) {
    logger.error({ err: error });
    throw error;
  }
};
