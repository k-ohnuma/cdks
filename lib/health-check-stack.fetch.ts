import { Handler } from "aws-lambda";
import { z } from "zod";
import { DiscordClient } from "./clients/discord-clients";

const envSchema = z.object({ FETCH_URLS: z.string() }).transform((item) => ({
  fetchUrls: item.FETCH_URLS.split(",")
    .map((url) => url.trim())
    .filter((url) => url !== ""),
}));

const postDiscord = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  await new DiscordClient(webhookUrl).postMesage(message);
};

export const handler: Handler = async () => {
  const { fetchUrls } = envSchema.parse(process.env);
  for (const url of fetchUrls) {
    try {
      const ret = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (ret.ok) continue;
      const body = await ret.text();
      await postDiscord(`url: ${url}, statusCode: ${ret.status}, body: ${body}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      await postDiscord(`url: ${url}, error: ${message}`);
    }
  }
};
