import { z } from "zod";

export const envs = z
  .object({
    ACP_BASE_ENDPOINT: z.string(),
    CREATE_CONTEST_TITLE: z.string(),
    TARGET_CONTESTS: z.string(),
    DISCORD_WEBHOOK_URL: z.string(),
    GITHUB_TOKEN: z.string(),
    SEARCH_MINUTE: z.string().optional(),
    CREATE_CONTEST_PUBLIC: z.string().optional(),
    CREATE_CONTEST_DURATION: z.string().optional(),
    PROBLEM_DIFFI_SET: z.string().optional(),
  })
  .transform((item) => {
    const targetContests = item.TARGET_CONTESTS.split(",");
    const defaultDiffSet = item.PROBLEM_DIFFI_SET ? item.PROBLEM_DIFFI_SET : "hai,cha,cha,midori,midori,mizu,mizu,ao";
    const problemDiffiSet = defaultDiffSet.split(",");
    return {
      // https://kenkoooo.com/atcoder
      acpBaseEndpoint: item.ACP_BASE_ENDPOINT,
      targetContests,
      discordWebhookUrl: item.DISCORD_WEBHOOK_URL,
      githubToken: item.GITHUB_TOKEN,
      searchMinute: item.SEARCH_MINUTE ? +item.SEARCH_MINUTE : 15,
      createContestTitle: item.CREATE_CONTEST_TITLE,
      createContestPublic: item.CREATE_CONTEST_PUBLIC ? item.CREATE_CONTEST_PUBLIC === "TRUE" : true,
      createContestDuration: item.CREATE_CONTEST_DURATION ? +item.CREATE_CONTEST_DURATION : 6000,
      problemDiffiSet,
    };
  });
export type Envs = z.infer<typeof envs>;

export const recentContents = z
  .object({
    id: z.string(),
    title: z.string(),
    memo: z.string(),
    owner_user_id: z.string(),
    start_epoch_second: z.number(),
    duration_second: z.number(),
    is_public: z.boolean(),
  })
  .array();
export type RecentContests = z.infer<typeof recentContents>;

export type CreateContest = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  duration_second: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_public: boolean;
  memo: string;
  mode: null;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  penalty_second: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  start_epoch_second: number;
  title: string;
};

export type UpdateContest = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  contest_id: string;
  problems: UpdatePromlem[];
};

export const createResp = z.object({
  contest_id: z.string(),
});

export const problemsJson = z
  .object({
    id: z.string(),
    contest_id: z.string(),
    problem_index: z.string(),
    name: z.string(),
    title: z.string(),
  })
  .array();
export type ProblemsJson = z.infer<typeof problemsJson>;

export const problemModelsJson = z.record(
  z.string(),
  z
    .object({
      difficulty: z.number().optional().nullable(),
      is_experimental: z.boolean().optional().nullable(),
    })
    .transform((item) => {
      return {
        difficulty: item.difficulty ? item.difficulty : undefined,
        is_experimental:
          item.is_experimental === true || item.is_experimental === false ? item.is_experimental : undefined,
      };
    }),
);
export type ProblemModelsJson = z.infer<typeof problemModelsJson>;

export type Problem = {
  id: string;
  difficulty: number;
};
export type DifficultyMap = {
  hai: Problem[];
  cha: Problem[];
  midori: Problem[];
  mizu: Problem[];
  ao: Problem[];
  ki: Problem[];
  dai: Problem[];
  aka: Problem[];
};

export type UpdatePromlem = {
  id: string;
  point: number;
  order: number;
};
