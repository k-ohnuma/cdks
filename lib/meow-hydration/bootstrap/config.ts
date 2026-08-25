import { z } from "zod";
import { parseEnv } from "../../shared/environment/parse-env";

const configSchema = z.object({
  TABLE_NAME: z.string().min(1),
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

export const parseMeowHydrationConfig = (env: NodeJS.ProcessEnv) => {
  const config = parseEnv(configSchema, env);
  return {
    tableName: config.TABLE_NAME,
    lineChannelAccessToken: config.LINE_CHANNEL_ACCESS_TOKEN,
    lineSendUserIds: config.LINE_SEND_USER_IDS,
  };
};
