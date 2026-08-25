import { DynamoDbProblemDifficultyRepository } from "../infrastructure/dynamodb-problem-difficulty-repository";
import { createApiHandler } from "../interface/api-handler";
import { GetProblemDifficulty } from "../usecase/get-problem-difficulty";
import { parseProblemDiffApiConfig } from "./config";

const config = parseProblemDiffApiConfig(process.env);
const repository = new DynamoDbProblemDifficultyRepository(config.tableName);
const usecase = new GetProblemDifficulty(repository);

export const handler = createApiHandler(usecase);
