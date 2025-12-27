import { APIGatewayEvent, Handler } from "aws-lambda";
import { z } from "zod";
import { getResponse } from "./utils/lib";
import { AtcoderProblemsClient, CreateContestInput } from "./clients/atcoder-problems-client";
import { ProblemPicker } from "./clients/problem-picker";

const color = z.union([
  z.literal("aka"),
  z.literal("dai"),
  z.literal("ki"),
  z.literal("ao"),
  z.literal("mizu"),
  z.literal("midori"),
  z.literal("cha"),
  z.literal("hai"),
]);

const eBody = z
  .object({
    start: z.coerce.number().int(),
    end: z.coerce.number().int(),
    colors: z.array(color),
    startEpochSecond: z.coerce.number().int().positive(),
    durationSecond: z.coerce.number().int().positive(),
    isPublic: z.coerce.boolean(),
    title: z.string().min(1),
    mode: z.union([z.literal("normal"), z.literal("training")]),
  })
  .transform((item) => {
    const start = item.start;
    const end = item.end;
    return {
      ...item,
      start: Math.min(...[start, end]),
      end: Math.max(...[start, end]),
    };
  });

const codeToMsg = {
  400: "invalid request format",
  401: "authorization required",
  404: "not found",
  500: "internal server error",
};

export const envs = z
  .object({
    ACP_BASE_ENDPOINT: z.string(),
  })
  .transform((item) => {
    return {
      // https://kenkoooo.com/atcoder
      acpBaseEndpoint: item.ACP_BASE_ENDPOINT,
    };
  });

const responseError = (code: number) => {
  const msg = codeToMsg[code as keyof typeof codeToMsg] ?? "unknown error";
  return getResponse({ error: msg }, code);
};

const getToken = (authorization?: string): string | undefined => {
  if (!authorization) return undefined;
  const m = authorization.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : undefined;
};

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    const rbody = event.body ?? "{}";
    const authorization = event.headers["Authorization"] ?? event.headers["authorization"] ?? "";
    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rbody);
    } catch {
      return responseError(400);
    }
    const eventBody = eBody.safeParse(jsonBody);
    if (!eventBody.success) return responseError(400);
    const body = eventBody.data;
    if (!eventBody.success) return responseError(400);
    const token = getToken(authorization);
    if (!token) return responseError(401);

    const env = envs.parse(process.env);

    const setting = contestSettings(body.startEpochSecond, body.durationSecond, body.isPublic, body.mode, body.title);

    const atcoderProblemsClient = new AtcoderProblemsClient(env.acpBaseEndpoint, token);
    const problemJson = await atcoderProblemsClient.getPromblemsJson();
    const problemModelJson = await atcoderProblemsClient.getProblemsModelJson();

    const picker = new ProblemPicker(problemJson, problemModelJson);
    const problems = picker.getRangeProblems(body.start, body.end, body.colors);

    const id = await atcoderProblemsClient.createContest(setting, problems);
    const url = atcoderProblemsClient.getContestUrl(id);

    return getResponse({ url });
  } catch (e) {
    console.error(e);
    return responseError(500);
  }
};

const contestSettings = (
  startEpochSecond: number,
  durationSecond: number,
  isPublic: boolean,
  mode: "normal" | "training",
  title: string,
): CreateContestInput => {
  return {
    start_epoch_second: startEpochSecond,
    duration_second: durationSecond,
    is_public: isPublic,
    memo: "",
    mode,
    penalty_second: 0,
    title,
  };
};
