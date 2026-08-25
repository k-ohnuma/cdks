import { z } from "zod";
import { PROBLEM_DIFFICULTIES } from "../usecase/models/virtual-contest";

const commaSeparatedStrings = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().min(1)).min(1));

const problemDifficulties = z
  .string()
  .default("hai,cha,cha,midori,midori,mizu,mizu,ao")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.enum(PROBLEM_DIFFICULTIES)).min(1));

const configSchema = z
  .object({
    ACP_BASE_ENDPOINT: z.string().url(),
    CREATE_CONTEST_TITLE: z.string().min(1),
    TARGET_CONTESTS: commaSeparatedStrings,
    DISCORD_WEBHOOK_URL: z.string().url(),
    GITHUB_TOKEN: z.string().min(1),
    SEARCH_MINUTE: z.coerce.number().int().positive().default(15),
    CREATE_CONTEST_PUBLIC: z.enum(["TRUE", "FALSE"]).default("TRUE"),
    CREATE_CONTEST_DURATION: z.coerce.number().int().positive().default(6000),
    PROBLEM_DIFFI_SET: problemDifficulties,
  })
  .transform((config) => ({
    acpBaseEndpoint: config.ACP_BASE_ENDPOINT,
    createContestTitle: config.CREATE_CONTEST_TITLE,
    targetContestNames: config.TARGET_CONTESTS,
    discordWebhookUrl: config.DISCORD_WEBHOOK_URL,
    githubToken: config.GITHUB_TOKEN,
    searchMinute: config.SEARCH_MINUTE,
    createContestPublic: config.CREATE_CONTEST_PUBLIC === "TRUE",
    createContestDuration: config.CREATE_CONTEST_DURATION,
    problemDifficulties: config.PROBLEM_DIFFI_SET,
  }));

export const parseVirtualContestConfig = (env: NodeJS.ProcessEnv) => configSchema.parse(env);
