import { z } from "zod";
import { getCurrentEpochSec } from "../utils/lib";
import { Logger } from "pino";
import { errors } from "../utils/error";

export const contest = z.object({
  id: z.string(),
  title: z.string(),
  memo: z.string(),
  owner_user_id: z.string(),
  start_epoch_second: z.number(),
  duration_second: z.number(),
  is_public: z.boolean(),
});
export type Contest = z.infer<typeof contest>;

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

export type UpdatePromlem = {
  id: string;
  point: number;
  order: number;
};

export type UpdateContestInput = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  contest_id: string;
  problems: UpdatePromlem[];
};

export type CreateContestInput = {
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

export const createResp = z.object({
  contest_id: z.string(),
});
export type CreateId = string;

export class AtcoderProblemsClient {
  private baseEndpoint: string;
  private githubToken: string;
  private logger: Logger;

  constructor(baseEndpoint: string, githubToken: string) {
    this.baseEndpoint = baseEndpoint;
    this.githubToken = githubToken;
  }

  getRecentContestEndpoint(): string {
    return `${this.baseEndpoint}/internal-api/contest/recent`;
  }

  getVirtualContestBaseEndpoint(): string {
    return `${this.baseEndpoint}/#/contest/show`;
  }

  getProblemsModelEndpoint(): string {
    return `${this.baseEndpoint}/resources/problem-models.json`;
  }

  getProblemsEndpoint(): string {
    return `${this.baseEndpoint}/resources/problems.json`;
  }

  getCreateContestEndpoint(): string {
    return `${this.baseEndpoint}/internal-api/contest/create`;
  }

  getUpdateContestEndpoint(): string {
    return `${this.baseEndpoint}/internal-api/contest/item/update`;
  }

  getUpcomingContest = async (searchMinute?: number): Promise<Contest[]> => {
    try {
      const endpoint = this.getRecentContestEndpoint();
      const f = await fetch(endpoint);
      const json = await f.json();
      const resp: Contest[] = contest.array().parse(json);
      const now = getCurrentEpochSec("sec");
      const end = searchMinute ? now + 60 * searchMinute : Infinity;
      return resp.filter((cc) => cc.start_epoch_second > now && cc.start_epoch_second < end);
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };
  getPromblemsJson = async (): Promise<ProblemsJson> => {
    try {
      const endpoint = this.getProblemsEndpoint();
      const f = await fetch(endpoint);
      const json = await f.json();
      return problemsJson.parse(json);
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  getProblemsModelJson = async (): Promise<ProblemModelsJson> => {
    try {
      const endpoint = this.getProblemsModelEndpoint();
      const f = await fetch(endpoint);
      const json = await f.json();
      return problemModelsJson.parse(json);
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  callCreateContest = async (body: CreateContestInput): Promise<CreateId> => {
    try {
      const endpoint = this.getCreateContestEndpoint();
      const create = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${this.githubToken}`,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
      const rjson = await create.json();
      const json = createResp.parse(rjson);
      return json.contest_id;
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  callUpdateContest = async (body: UpdateContestInput) => {
    try {
      const endpoint = this.getUpdateContestEndpoint();
      const _create = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${this.githubToken}`,
        },
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  createContest = async (createProps: CreateContestInput, problems: UpdatePromlem[]): Promise<CreateId> => {
    try {
      const createId = await this.callCreateContest(createProps);
      const update: UpdateContestInput = {
        contest_id: createId,
        problems,
      };
      await this.callUpdateContest(update);
      return createId;
    } catch (e) {
      this.handleError(e);
      throw e;
    }
  };

  private handleError(e: unknown) {
    this.logger.error(e);
    throw errors.upstreamBadGateway({ type: "atcoder-problems" });
  }
}
