import { z } from "zod";
import { parseEnv } from "../../shared/environment/parse-env";

const configSchema = z.object({
  TABLE_NAME: z.string().min(1),
});

export const parseMeowHydrationConfig = (env: NodeJS.ProcessEnv) => {
  const config = parseEnv(configSchema, env);
  return { tableName: config.TABLE_NAME };
};
