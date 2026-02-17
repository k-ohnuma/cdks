import { APIGatewayEvent, Handler } from "aws-lambda";
import { z } from "zod";
import { AppError, errors } from "./utils/error";
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
  const { tableName } = envSchema.parse(process.env);
  const dynamoDBClient = new AwsDynamoDBDocumentClient(logger);
  const repo = new ProblemDifficultyRepository(tableName, dynamoDBClient);
  try {
    const problemId = event.queryStringParameters?.problemId;
    if (!problemId) throw errors.validation({ msg: "problemId is required" });
    const data = await run(problemId, repo);
    if (!data)
      throw errors.notFound({
        msg: `problemId: ${problemId} record is not found.`,
      });

    return getResponse(data, 200);
  } catch (e) {
    if (e instanceof AppError) {
      const resp = {
        code: e.code,
        message: e.message,
        type: e.type,
        status: e.status,
      };
      return getResponse(resp, resp.status);
    }
    logger.error(e);
    const resp = {
      code: "INTERNAL",
      message: "Internal Server Error",
      status: 500,
    };
    return getResponse(resp, 500);
  }
};
