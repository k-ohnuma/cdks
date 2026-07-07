import { APIGatewayEvent, Handler } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse, parseEnv } from "./utils/api";
import { errors } from "./utils/error";
import { getResponse } from "./utils/lib";
import { ProblemDifficulty, ProblemDifficultyRepository } from "./repo/problem-diff-table";
import { AwsDynamoDBDocumentClient } from "./clients/dynamo-db-client";
import { logger } from "./utils/logger";

const envSchema = z
  .object({
    TABLE_NAME: z.string(),
  })
  .transform((item) => {
    return {
      tableName: item.TABLE_NAME,
    };
  });

const run = async (problemId: string, repo: ProblemDifficultyRepository): Promise<ProblemDifficulty | undefined> => {
  return await repo.get(problemId);
};

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    const { tableName } = parseEnv(envSchema, process.env);
    const dynamoDBClient = new AwsDynamoDBDocumentClient(logger);
    const repo = new ProblemDifficultyRepository(tableName, dynamoDBClient);
    const problemId = event.queryStringParameters?.problemId;
    if (!problemId) throw errors.validation({ msg: "problemId is required" });
    const data = await run(problemId, repo);
    if (!data)
      throw errors.notFound({
        msg: `problemId: ${problemId} record is not found.`,
      });

    return getResponse(data, 200);
  } catch (e) {
    return getErrorResponse(e, logger);
  }
};
