import { APIGatewayProxyResult } from "aws-lambda";
import { Logger } from "pino";
import { z } from "zod";
import { AppError, errors } from "./error";
import { getResponse } from "./lib";
import { logger as defaultLogger } from "./logger";

type ApiErrorResponse = {
  code: string;
  message: string;
  status: number;
  type?: string;
};

export const parseRequestBody = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  bodyString: string | null,
): z.infer<TSchema> => {
  let body: unknown;
  try {
    body = JSON.parse(bodyString ?? "{}");
  } catch {
    throw errors.validation({ msg: "Invalid request JSON", type: "request" });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw errors.validation({ msg: "Invalid request format", type: "request" });
  }

  return parsed.data;
};

export const parseEnv = <TSchema extends z.ZodTypeAny>(schema: TSchema, env: NodeJS.ProcessEnv): z.infer<TSchema> => {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    defaultLogger.error({ err: parsed.error, type: "env" });
    throw errors.internal({ msg: "Invalid environment configuration", type: "env" });
  }

  return parsed.data;
};

export const getErrorResponse = (error: unknown, logger: Logger = defaultLogger): APIGatewayProxyResult => {
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      code: error.code,
      message: error.message,
      status: error.status,
      type: error.type,
    };
    return getResponse(response, error.status);
  }

  logger.error({ err: error });
  return getResponse(
    {
      code: "INTERNAL",
      message: "Internal Server Error",
      status: 500,
    },
    500,
  );
};
