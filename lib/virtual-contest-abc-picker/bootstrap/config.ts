import { z } from "zod";

const configSchema = z
  .object({
    ACP_BASE_ENDPOINT: z.string().url(),
  })
  .transform((config) => ({
    acpBaseEndpoint: config.ACP_BASE_ENDPOINT,
  }));

export const parseVirtualContestAbcPickerConfig = (env: NodeJS.ProcessEnv) => configSchema.parse(env);
