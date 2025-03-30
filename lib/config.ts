export type Config = {
  env: string;
  resourcePrefix: string;
};

export const DEFAULT_CONFIG: Config = {
  env: "dev",
  resourcePrefix: "cdks",
};
