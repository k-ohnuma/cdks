import { z } from "zod";
import { parseEnv } from "../../shared/environment/parse-env";

const lineMessagingConfigSchema = z.object({
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1),
  LINE_SEND_USER_IDS: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((userId) => userId.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().min(1)).min(1)),
});

const configSchema = lineMessagingConfigSchema.extend({
  TABLE_NAME: z.string().min(1),
});

const toLineMessagingConfig = (config: z.infer<typeof lineMessagingConfigSchema>) => ({
  lineChannelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
  lineSendUserIds: config.LINE_SEND_USER_IDS,
});

export const parseLineMessagingConfig = (env: NodeJS.ProcessEnv) => {
  return toLineMessagingConfig(parseEnv(lineMessagingConfigSchema, env));
};

export const parseMeowHydrationConfig = (env: NodeJS.ProcessEnv) => {
  const config = parseEnv(configSchema, env);
  return {
    tableName: config.TABLE_NAME,
    ...toLineMessagingConfig(config),
  };
};
