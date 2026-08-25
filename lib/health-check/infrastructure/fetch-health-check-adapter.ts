import { HealthCheckResult } from "../usecase/models/health-check-result";
import { HealthCheckPort } from "../usecase/ports/health-check-port";

type FetchHealthCheckAdapterOptions = {
  timeoutMs: number;
  maxResponseBodyLength?: number;
};

export class FetchHealthCheckAdapter implements HealthCheckPort {
  private readonly timeoutMs: number;
  private readonly maxResponseBodyLength: number;

  constructor({ timeoutMs, maxResponseBodyLength = 500 }: FetchHealthCheckAdapterOptions) {
    this.timeoutMs = timeoutMs;
    this.maxResponseBodyLength = maxResponseBodyLength;
  }

  async check(url: string): Promise<HealthCheckResult> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (response.ok) return { ok: true, url };

      const responseBody = (await response.text()).slice(0, this.maxResponseBodyLength);
      return {
        ok: false,
        failure: {
          kind: "http",
          url,
          status: response.status,
          responseBody: responseBody || undefined,
        },
      };
    } catch (error) {
      return {
        ok: false,
        failure: {
          kind: "network",
          url,
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
