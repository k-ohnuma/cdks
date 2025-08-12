export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_BAD_GATEWAY"
  | "INTERNAL"
  | "ERROR";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly type?: string;
  constructor(code: ErrorCode, status: number, message: string, type?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.type = type;
  }
}

export interface ErrorOptions {
  msg?: string;
  type?: string;
}

export const errors = {
  validation: ({ msg = "Bad Request", type }: ErrorOptions = {}) => new AppError("VALIDATION_ERROR", 400, msg, type),

  unauthorized: ({ msg = "Unauthorized", type }: ErrorOptions = {}) => new AppError("UNAUTHORIZED", 401, msg, type),

  notFound: ({ msg = "Not Found", type }: ErrorOptions = {}) => new AppError("NOT_FOUND", 404, msg, type),

  rateLimited: ({ msg = "Too Many Requests", type }: ErrorOptions = {}) => new AppError("RATE_LIMITED", 429, msg, type),

  upstreamBadGateway: ({ msg = "Bad Gateway", type }: ErrorOptions = {}) =>
    new AppError("UPSTREAM_BAD_GATEWAY", 502, msg, type),

  internal: ({ msg = "Internal Server Error", type }: ErrorOptions = {}) => new AppError("INTERNAL", 500, msg, type),
};

export const codeToThrow = (statusCode: number, msg?: string, type?: string) => {
  if (statusCode >= 200 && statusCode < 300) return;

  switch (statusCode) {
    case 400:
      throw errors.validation({ msg, type });
    case 401:
      throw errors.unauthorized({ msg, type });
    case 404:
      throw errors.notFound({ msg, type });
    case 429:
      throw errors.rateLimited({ msg, type });
    case 502:
      throw errors.upstreamBadGateway({ msg, type });
    case 500:
      throw errors.internal({ msg, type });
    default: {
      const appError = new AppError("ERROR", statusCode, msg ?? "", type);
      throw appError;
    }
  }
};
