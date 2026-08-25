import { Logger } from "pino";
import { AppError, codeToThrow, errors } from "../shared/errors/app-error";
import { logger as defaultLogger } from "../shared/logging/logger";
import { MessageSender } from "../shared/messaging/message-sender";

const DEFAULT_ENDPOINT = "https://api.line.me/v2/bot/message/push";

type LineMessagingClientOptions = {
  endpoint?: string;
  logger?: Logger;
};

export class LineMessagingClient implements MessageSender {
  private readonly endpoint: string;
  private readonly logger: Logger;

  constructor(
    private readonly channelAccessToken: string,
    private readonly sendUserIds: string[],
    options: LineMessagingClientOptions = {},
  ) {
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.logger = options.logger ?? defaultLogger;
  }

  async postMessage(message: string): Promise<void> {
    try {
      await Promise.all(this.sendUserIds.map((userId) => this.pushMessage(userId, message)));
    } catch (error) {
      if (error instanceof AppError) throw error;

      this.logger.error({ err: error, type: "line" });
      throw errors.upstreamBadGateway({ type: "line" });
    }
  }

  private async pushMessage(userId: string, message: string): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.channelAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: message }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => undefined);
      this.logger.error({ errorBody, status: response.status, type: "line" });
      const message =
        typeof errorBody === "object" && errorBody !== null && "message" in errorBody
          ? String(errorBody.message)
          : response.statusText;
      codeToThrow(response.status, message, "line");
    }
  }
}
