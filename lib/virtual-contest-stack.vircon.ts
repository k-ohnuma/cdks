import "source-map-support/register";

import { Handler } from "aws-lambda";
import { getResponse } from "./lib";
import { envs } from "./virtual-contest-stack.types";
import {
  createContest,
  createProblemsSet,
  getSetProblems,
  getTargetContests,
  getUpcomingContests,
  postDiscord,
} from "./virtual-contest-stack.lib";

export const handler: Handler = async (_event) => {
  const env = envs.parse(process.env);

  const recentContestEnd = `${env.acpBaseEndpoint}/internal-api/contest/recent`;
  const contestBaseUrl = `${env.acpBaseEndpoint}/#/contest/show`;

  const contests = await getUpcomingContests(recentContestEnd, env.searchMinute);
  const targetContests = getTargetContests(env.targetContests, contests, contestBaseUrl);

  if (targetContests.length !== 0) {
    const texts = ["本日は以下のバチャコンが開催されます！"];
    targetContests.forEach((item) => {
      texts.push(`${item.title}：${item.url}`);
    });
    console.log(texts);
    await postDiscord(texts.join("\n"), env.discordWebhookUrl);
    return getResponse({ result: "ok" }, 200);
  }

  // 環境変数に設定されたdiff情報から問題抽出
  const problemsSet = await createProblemsSet(env.acpBaseEndpoint);
  const problems = getSetProblems(problemsSet, env.problemDiffiSet);

  // 作成
  const createId = await createContest(env, problems);

  const texts = ["本日はバチャコン開催されないので作りました！"];
  texts.push(`${env.createContestTitle}：${contestBaseUrl}/${createId}`);
  await postDiscord(texts.join("\n"), env.discordWebhookUrl);
  return getResponse({ result: "ok" }, 200);
};
