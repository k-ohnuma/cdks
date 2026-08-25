import { HealthCheckFailure, HealthCheckResult } from "./models/health-check-result";
import { HealthCheckPort } from "./ports/health-check-port";
import { NotificationPort } from "../../shared/notification/notification-port";

export type RunHealthChecksInput = {
  urls: string[];
};

export type RunHealthChecksOutput = {
  results: HealthCheckResult[];
};

export interface RunHealthChecksInputPort {
  execute(input: RunHealthChecksInput): Promise<RunHealthChecksOutput>;
}

export class RunHealthChecks implements RunHealthChecksInputPort {
  constructor(
    private readonly healthCheck: HealthCheckPort,
    private readonly notifications: NotificationPort[],
  ) {}

  async execute(input: RunHealthChecksInput): Promise<RunHealthChecksOutput> {
    const results = await Promise.all(input.urls.map((url) => this.healthCheck.check(url)));
    const failures = results.flatMap((result) => (result.ok ? [] : [result.failure]));

    if (failures.length > 0) {
      const notification = {
        title: "Health check failed",
        message: failures.map(formatFailure).join("\n\n"),
        severity: "error" as const,
      };
      await Promise.all(this.notifications.map((notifier) => notifier.send(notification)));
    }

    return { results };
  }
}

const formatFailure = (failure: HealthCheckFailure): string => {
  if (failure.kind === "http") {
    return [
      `url: ${failure.url}`,
      `statusCode: ${failure.status}`,
      failure.responseBody ? `body: ${failure.responseBody}` : undefined,
    ]
      .filter((line): line is string => line !== undefined)
      .join(", ");
  }

  return `url: ${failure.url}, error: ${failure.message}`;
};
