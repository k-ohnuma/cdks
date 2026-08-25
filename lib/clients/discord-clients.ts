import { Logger } from "pino";
import { AppError, codeToThrow, errors } from "../shared/errors/app-error";
import { logger as defaultLogger } from "../shared/logging/logger";
import { MessageSender } from "../shared/messaging/message-sender";

export class DiscordClient implements MessageSender {
  constructor(
    private readonly endpoint: string,
    private readonly logger: Logger = defaultLogger,
  ) {}

  async postMessage(message: string): Promise<void> {
    try {
      const body = {
        content: message,
      };
      const ret = await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!ret.ok) {
        const errorJson = await ret.json().catch(() => {});
        this.logger.error({ errorJson, ret, type: "discord" });
        const statusCode = ret.status;
        codeToThrow(statusCode, ret.statusText, "discord");
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: unknown): never {
    if (e instanceof AppError) {
      throw e;
    }
    this.logger.error(e);
    throw errors.upstreamBadGateway({ type: "discord" });
  }
}
