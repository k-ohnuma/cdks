import { HealthCheckResult } from "../models/health-check-result";

export interface HealthCheckPort {
  check(url: string): Promise<HealthCheckResult>;
}
