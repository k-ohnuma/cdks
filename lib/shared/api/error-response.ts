import { APIGatewayProxyResult } from "aws-lambda";
import { Logger } from "pino";
import { AppError } from "../errors/app-error";
import { logger as defaultLogger } from "../logging/logger";
import { getResponse } from "./response";

type ApiErrorResponse = {
  code: string;
  message: string;
  status: number;
  type?: string;
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
