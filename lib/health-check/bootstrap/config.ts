import { z } from "zod";

const fetchUrlsSchema = z
  .string()
  .transform((value) => [
    ...new Set(
      value
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  ])
  .pipe(z.array(z.string().url()).min(1));

const configSchema = z
  .object({
    FETCH_URLS: fetchUrlsSchema,
    DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  })
  .transform((config) => ({
    fetchUrls: config.FETCH_URLS,
    discordWebhookUrl: config.DISCORD_WEBHOOK_URL || undefined,
    requestTimeoutMs: config.REQUEST_TIMEOUT_MS,
  }));

export const parseHealthCheckConfig = (env: NodeJS.ProcessEnv) => configSchema.parse(env);
