import { z } from "zod";
import { errors } from "../errors/app-error";

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
