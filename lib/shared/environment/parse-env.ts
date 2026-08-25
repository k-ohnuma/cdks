import { z } from "zod";
import { errors } from "../errors/app-error";
import { logger } from "../logging/logger";

export const parseEnv = <TSchema extends z.ZodTypeAny>(schema: TSchema, env: NodeJS.ProcessEnv): z.infer<TSchema> => {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    logger.error({ err: parsed.error, type: "env" });
    throw errors.internal({ msg: "Invalid environment configuration", type: "env" });
  }

  return parsed.data;
};
