import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse } from "../../shared/api/error-response";
import { parseRequestBody } from "../../shared/api/request";
import { getResponse } from "../../shared/api/response";
import { CreateVsnipInputPort } from "../usecase/create-vsnip";

const requestSchema = z.object({
  title: z.string().trim().min(1),
  prefix: z.string(),
  body: z.string(),
  description: z.string(),
});

export type ApiHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

export const createApiHandler = (usecase: CreateVsnipInputPort): ApiHandler => {
  return async (event) => {
    try {
      const input = parseRequestBody(requestSchema, event.body);
      return getResponse(usecase.execute(input));
    } catch (error) {
      return getErrorResponse(error);
    }
  };
};
