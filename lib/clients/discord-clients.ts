import { Logger } from "pino";
import { logger } from "../utils/logger";
import { codeToThrow, errors } from "../utils/error";

export class DiscordClient {
  private endpoint: string;
  private logger: Logger;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.logger = logger;
  }

  postMesage = async (message: string) => {
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
        logger.error({ errorJson, ret, type: "discord" });
        const statusCode = ret.status;
        codeToThrow(statusCode, ret.statusText, "discord");
      }
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  private handleError(e: unknown) {
    this.logger.error(e);
    throw errors.upstreamBadGateway({ type: "discord" });
  }
}
