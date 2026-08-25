import { z } from "zod";
import { getErrorResponse } from "../../lib/shared/api/error-response";
import { parseRequestBody } from "../../lib/shared/api/request";
import { parseEnv } from "../../lib/shared/environment/parse-env";
import { errors } from "../../lib/shared/errors/app-error";
import { logger } from "../../lib/shared/logging/logger";

describe("parseRequestBody", () => {
  const schema = z.object({
    value: z.string(),
  });

  it("", () => {
    const result = parseRequestBody(schema, JSON.stringify({ value: "ok" }));

    expect(result).toStrictEqual({ value: "ok" });
  });

  it("", () => {
    expect(() => parseRequestBody(schema, "{")).toThrow("Invalid request JSON");
  });

  it("", () => {
    expect(() => parseRequestBody(schema, JSON.stringify({ value: 1 }))).toThrow("Invalid request format");
  });
});

describe("", () => {
  const schema = z.object({
    TABLE_NAME: z.string(),
  });

  it("", () => {
    jest.spyOn(logger, "error").mockImplementation();

    expect(() => parseEnv(schema, {})).toThrow("Invalid environment configuration");
  });
});

describe("", () => {
  it("", () => {
    const response = getErrorResponse(errors.notFound({ msg: "missing", type: "test" }));

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toStrictEqual({
      code: "NOT_FOUND",
      message: "missing",
      status: 404,
      type: "test",
    });
  });
});
