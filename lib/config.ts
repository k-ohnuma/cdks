export type Config = {
  env: string;
  resourcePrefix: string;
  virtualContest: {
    endpoint: string;
    targetContests: string[];
    contestName: string;
  };
};

export const DEFAULT_CONFIG: Config = {
  env: "dev",
  resourcePrefix: "cdks",
  virtualContest: {
    endpoint: "https://kenkoooo.com/atcoder",
    contestName: "代替コン",
    targetContests: ["まよコン"],
  },
};
