import { DynamoDBClient, DynamoDBServiceException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Logger } from "pino";
import { AppError, errors } from "../../shared/errors/app-error";
import { logger as defaultLogger } from "../../shared/logging/logger";
import { ProblemDifficulty } from "../domain/problem-difficulty";
import { ProblemDifficultyRepository } from "../domain/problem-difficulty-repository";

export class DynamoDbProblemDifficultyRepository implements ProblemDifficultyRepository {
  constructor(
    private readonly tableName: string,
    private readonly client: DynamoDBDocument = DynamoDBDocument.from(new DynamoDBClient({}), {
      marshallOptions: { removeUndefinedValues: true },
    }),
    private readonly logger: Logger = defaultLogger,
  ) {}

  async findById(problemId: string): Promise<ProblemDifficulty | undefined> {
    try {
      const result = await this.client.get({
        TableName: this.tableName,
        Key: { problemId },
      });
      return result.Item as ProblemDifficulty | undefined;
    } catch (error) {
      this.handleError(error);
    }
  }

  async save(problemDifficulty: ProblemDifficulty): Promise<void> {
    try {
      await this.client.put({
        TableName: this.tableName,
        Item: problemDifficulty,
      });
      this.logger.info({
        msg: "Saved problem difficulty",
        tableName: this.tableName,
        problemId: problemDifficulty.problemId,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    this.logger.error({ err: error, type: "dynamodb" });

    if (error instanceof DynamoDBServiceException) {
      if (error.name === "ProvisionedThroughputExceededException" || error.name === "ThrottlingException") {
        throw errors.rateLimited({ msg: "DynamoDB throttled", type: "dynamodb" });
      }

      throw errors.internal({ msg: error.message || "DynamoDB request failed", type: "dynamodb" });
    }

    if (error instanceof AppError) throw error;
    throw errors.internal({ msg: "Unexpected DynamoDB error", type: "dynamodb" });
  }
}
