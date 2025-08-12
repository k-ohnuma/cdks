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
