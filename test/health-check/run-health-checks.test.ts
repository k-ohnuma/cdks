import { HealthCheckResult } from "../../lib/health-check/usecase/models/health-check-result";
import { HealthCheckPort } from "../../lib/health-check/usecase/ports/health-check-port";
import { RunHealthChecks } from "../../lib/health-check/usecase/run-health-checks";
import { NotificationPort } from "../../lib/shared/notification/notification-port";

describe("RunHealthChecks", () => {
  it("does not send a notification when every endpoint is healthy", async () => {
    const healthCheck: HealthCheckPort = {
      check: jest.fn(async (url): Promise<HealthCheckResult> => ({ ok: true, url })),
    };
    const notification: NotificationPort = {
      send: jest.fn(async () => {}),
    };
    const usecase = new RunHealthChecks(healthCheck, [notification]);

    const output = await usecase.execute({ urls: ["https://example.com/health"] });

    expect(output.results).toStrictEqual([{ ok: true, url: "https://example.com/health" }]);
    expect(notification.send).not.toHaveBeenCalled();
  });

  it("collects failures and sends one notification", async () => {
    const healthCheck: HealthCheckPort = {
      check: jest.fn(async (url): Promise<HealthCheckResult> => {
        if (url.endsWith("/http-error")) {
          return {
            ok: false,
            failure: {
              kind: "http",
              url,
              status: 503,
              responseBody: "unavailable",
            },
          };
        }

        return {
          ok: false,
          failure: {
            kind: "network",
            url,
            message: "request timed out",
          },
        };
      }),
    };
    const notification: NotificationPort = {
      send: jest.fn(async () => {}),
    };
    const usecase = new RunHealthChecks(healthCheck, [notification]);

    await usecase.execute({
      urls: ["https://example.com/http-error", "https://example.com/timeout"],
    });

    expect(notification.send).toHaveBeenCalledTimes(1);
    expect(notification.send).toHaveBeenCalledWith({
      title: "Health check failed",
      severity: "error",
      message:
        "url: https://example.com/http-error, statusCode: 503, body: unavailable\n\n" +
        "url: https://example.com/timeout, error: request timed out",
    });
  });
});
