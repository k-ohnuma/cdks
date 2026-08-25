import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse } from "../../shared/api/error-response";
import { parseRequestBody } from "../../shared/api/request";
import { getResponse } from "../../shared/api/response";
import { errors } from "../../shared/errors/app-error";
import { CreateContestFromRangeInputPort } from "../usecase/create-contest-from-range";
import { PROBLEM_COLORS } from "../usecase/models/contest";

const requestSchema = z.object({
  start: z.coerce.number().int().positive(),
  end: z.coerce.number().int().positive(),
  colors: z.array(z.enum(PROBLEM_COLORS)).min(1),
  startEpochSecond: z.coerce.number().int().positive(),
  durationSecond: z.coerce.number().int().positive(),
  isPublic: z.boolean(),
  title: z.string().trim().min(1),
  mode: z.enum(["normal", "training"]),
});

const getBearerToken = (authorization?: string): string | undefined => {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1].trim();
  return token || undefined;
};

export type ApiHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

export const createApiHandler = (usecase: CreateContestFromRangeInputPort): ApiHandler => {
  return async (event) => {
    try {
      const body = parseRequestBody(requestSchema, event.body);
      const authorization = event.headers.Authorization ?? event.headers.authorization;
      const accessToken = getBearerToken(authorization);
      if (!accessToken) {
        throw errors.unauthorized({
          msg: "Authorization bearer token is required",
          type: "request",
        });
      }
      const contest = await usecase.execute({ ...body, accessToken });
      return getResponse({ url: contest.url });
    } catch (error) {
      return getErrorResponse(error);
    }
  };
};
