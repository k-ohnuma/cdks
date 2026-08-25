import { z } from "zod";

const apiConfigSchema = z.object({
  TABLE_NAME: z.string().min(1),
});

const syncConfigSchema = apiConfigSchema.extend({
  ACP_BASE_ENDPOINT: z.string().url(),
  WRITE_CONCURRENCY: z.coerce.number().int().positive().default(15),
  WRITE_INTERVAL_MS: z.coerce.number().int().nonnegative().default(500),
});

export const parseProblemDiffApiConfig = (env: NodeJS.ProcessEnv) => {
  const config = apiConfigSchema.parse(env);
  return { tableName: config.TABLE_NAME };
};

export const parseProblemDiffSyncConfig = (env: NodeJS.ProcessEnv) => {
  const config = syncConfigSchema.parse(env);
  return {
    tableName: config.TABLE_NAME,
    acpBaseEndpoint: config.ACP_BASE_ENDPOINT,
    writeConcurrency: config.WRITE_CONCURRENCY,
    writeIntervalMs: config.WRITE_INTERVAL_MS,
  };
};
