export type HealthCheckFailure =
  | {
      kind: "http";
      url: string;
      status: number;
      responseBody?: string;
    }
  | {
      kind: "network";
      url: string;
      message: string;
    };

export type HealthCheckResult =
  | {
      ok: true;
      url: string;
    }
  | {
      ok: false;
      failure: HealthCheckFailure;
    };
