import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { getErrorResponse } from "../../shared/api/error-response";
import { getResponse } from "../../shared/api/response";
import { errors } from "../../shared/errors/app-error";
import { GetProblemDifficultyInputPort } from "../usecase/get-problem-difficulty";

export type ApiHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

export const createApiHandler = (usecase: GetProblemDifficultyInputPort): ApiHandler => {
  return async (event) => {
    try {
      const problemId = event.queryStringParameters?.problemId?.trim();
      if (!problemId) throw errors.validation({ msg: "problemId is required", type: "request" });

      const problemDifficulty = await usecase.execute(problemId);
      if (!problemDifficulty) {
        throw errors.notFound({ msg: `problemId: ${problemId} record is not found.` });
      }

      return getResponse(problemDifficulty);
    } catch (error) {
      return getErrorResponse(error);
    }
  };
};
