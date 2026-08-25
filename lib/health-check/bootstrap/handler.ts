import { Handler } from "aws-lambda";
import { DiscordClient } from "../../clients/discord-clients";
import { MessageNotificationAdapter } from "../../shared/notification/message-notification-adapter";
import { NotificationPort } from "../../shared/notification/notification-port";
import { FetchHealthCheckAdapter } from "../infrastructure/fetch-health-check-adapter";
import { RunHealthChecks } from "../usecase/run-health-checks";
import { parseHealthCheckConfig } from "./config";

const config = parseHealthCheckConfig(process.env);
const healthCheck = new FetchHealthCheckAdapter({ timeoutMs: config.requestTimeoutMs });
const notifications: NotificationPort[] = config.discordWebhookUrl
  ? [new MessageNotificationAdapter(new DiscordClient(config.discordWebhookUrl))]
  : [];
const usecase = new RunHealthChecks(healthCheck, notifications);

export const handler: Handler = async () => {
  return await usecase.execute({ urls: config.fetchUrls });
};
