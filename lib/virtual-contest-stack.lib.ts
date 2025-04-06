import { getCurrentEpochSec } from "./lib";
import {
  CreateContest,
  createResp,
  DifficultyMap,
  Envs,
  Problem,
  problemModelsJson,
  ProblemModelsJson,
  problemsJson,
  ProblemsJson,
  recentContents,
  RecentContests,
  UpdateContest,
  UpdatePromlem,
} from "./virtual-contest-stack.types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { randomInt } from "crypto";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getTargetContests = (targetContestNames: string[], contests: RecentContests, contestBaseUrl: string) => {
  return targetContestNames
    .map((title) => {
      const found = contests.find((c) => c.title === title);
      return found ? { title: found.title, url: `${contestBaseUrl}/${found.id}` } : null;
    })
    .filter((c): c is { title: string; url: string } => c !== null);
};

export const postDiscord = async (content: string, url: string) => {
  const body = {
    content,
  };
  const ret = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!ret.ok) {
    const error = await ret.json();
    console.log(error);
    throw new Error(error);
  }
};

export const getUpcomingContests = async (endpoint: string, searchMinute?: number): Promise<RecentContests> => {
  const f = await fetch(endpoint);
  const json = await f.json();
  const resp = recentContents.parse(json);
  const now = getCurrentEpochSec("sec");
  const end = searchMinute ? now + 60 * searchMinute : Infinity;
  return resp.filter((cc) => cc.start_epoch_second > now && cc.start_epoch_second < end);
};

export const get21JSTEpoch = (): number => {
  const nowEpochSec = getCurrentEpochSec("sec");
  const now = dayjs.unix(nowEpochSec).tz("Asia/Tokyo");
  const target = now.hour(21).minute(0).second(0).millisecond(0);
  return target.unix();
};

const _createContest = async (url: string, body: CreateContest, token: string) => {
  const create = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });
  const rjson = await create.json();
  const json = createResp.parse(rjson);
  return json.contest_id;
};

export const charToKanji = (char: string): string => {
  switch (char) {
    case "hai":
      return "灰";
    case "cha":
      return "茶";
    case "midori":
      return "緑";
    case "mizu":
      return "水";
    case "ao":
      return "青";
    case "ki":
      return "黄";
    case "dai":
      return "橙";
    case "aka":
      return "赤";
    default:
      throw new Error(`unexpected char ${char}`);
  }
};

const clasifyProblems = (problems: Problem[]): DifficultyMap => {
  const map: DifficultyMap = {
    hai: [],
    cha: [],
    midori: [],
    mizu: [],
    ao: [],
    ki: [],
    dai: [],
    aka: [],
  };
  for (const problem of problems) {
    if (problem.difficulty <= 399) {
      map.hai.push(problem);
    } else if (problem.difficulty <= 799) {
      map.cha.push(problem);
    } else if (problem.difficulty <= 1199) {
      map.midori.push(problem);
    } else if (problem.difficulty <= 1599) {
      map.mizu.push(problem);
    } else if (problem.difficulty <= 1999) {
      map.ao.push(problem);
    } else if (problem.difficulty <= 2399) {
      map.ki.push(problem);
    } else if (problem.difficulty <= 2799) {
      map.dai.push(problem);
    } else {
      map.aka.push(problem);
    }
  }
  return map;
};

const getPromblemsJson = async (url: string): Promise<ProblemsJson> => {
  const f = await fetch(url);
  const json = await f.json();
  return problemsJson.parse(json);
};

const getProblemsModelJson = async (url: string): Promise<ProblemModelsJson> => {
  const f = await fetch(url);
  const json = await f.json();
  return problemModelsJson.parse(json);
};

export const createProblemsSet = async (baseUrl: string) => {
  const problems = await getPromblemsJson(`${baseUrl}/resources/problems.json`);
  const problemModels = await getProblemsModelJson(`${baseUrl}/resources/problem-models.json`);
  const abcProbs: Problem[] = problems
    .filter((item) => item.id.startsWith("abc"))
    .map((item) => {
      const model = problemModels[item.id];
      if (model === undefined || model.difficulty === undefined || model.is_experimental === undefined) {
        return undefined;
      }
      return {
        id: item.id,
        difficulty: model.difficulty,
        is_experimental: model.is_experimental,
      };
    })
    .filter((item) => item !== undefined)
    .filter((item) => !item.is_experimental && item.difficulty >= 0);
  return clasifyProblems(abcProbs);
};

export const getSetProblems = (map: DifficultyMap, difficulty: string[]): UpdatePromlem[] => {
  const problmes: UpdatePromlem[] = [];
  difficulty.forEach((diff, idx) => {
    const problems = map[diff as keyof DifficultyMap];
    const index = randomInt(problems.length);
    const [selected] = problems.splice(index, 1);
    problmes.push({
      id: selected.id,
      point: (idx + 1) * 100,
      order: idx,
    });
  });
  return problmes;
};

export const createContest = async (env: Envs, setProblems: UpdatePromlem[]) => {
  const contestCreateEnd = `${env.acpBaseEndpoint}/internal-api/contest/create`;
  const contestUpdateEnd = `${env.acpBaseEndpoint}/internal-api/contest/item/update`;
  const setJaForMemo = env.problemDiffiSet.map((item) => charToKanji(item));

  const createBody: CreateContest = {
    duration_second: env.createContestDuration,
    is_public: env.createContestPublic,
    memo: `いつも参加しているコンテストが開催されない日のための代替コンテストです。ABCのみ、試験管なし。\n全${setJaForMemo.length}問：${setJaForMemo.join(",")}`,
    mode: null,
    penalty_second: 300,
    start_epoch_second: get21JSTEpoch(),
    title: env.createContestTitle,
  };

  const createId = await _createContest(contestCreateEnd, createBody, env.githubToken);
  const update: UpdateContest = {
    contest_id: createId,
    problems: setProblems,
  };
  console.log(update);

  const ret = await fetch(contestUpdateEnd, {
    method: "POST",
    body: JSON.stringify(update),
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${env.githubToken}`,
    },
  });
  if (!ret.ok) {
    throw new Error();
  }
  return createId;
};
