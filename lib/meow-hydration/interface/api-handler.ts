import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { getErrorResponse } from "../../shared/api/error-response";
import { parseRequestBody } from "../../shared/api/request";
import { getResponse } from "../../shared/api/response";
import { ProcessHydrationEventInputPort } from "../usecase/process-hydration-event";

const timestampSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
    "Invalid timestamp",
  );

const eventBodySchema = z.discriminatedUnion("type", [
  z.object({
    timestamp: timestampSchema,
    type: z.literal("DRINK"),
    amountMl: z.number().positive(),
  }),
  z.object({
    timestamp: timestampSchema,
    type: z.literal("REFILL"),
  }),
]);

export type ApiHandler = (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>;

export const createApiHandler = (usecase: ProcessHydrationEventInputPort): ApiHandler => {
  return async (event) => {
    try {
      const input = parseRequestBody(eventBodySchema, event.body);
      return getResponse(await usecase.execute(input));
    } catch (error) {
      return getErrorResponse(error);
    }
  };
};
