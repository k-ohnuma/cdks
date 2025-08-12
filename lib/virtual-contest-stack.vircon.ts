import "source-map-support/register";

import { Handler } from "aws-lambda";
import { getResponse } from "./utils/lib";
import { envs } from "./virtual-contest-stack.types";
import { charToKanji, get21JSTEpoch, getUpcomingTargetContests } from "./virtual-contest-stack.lib";
import { AtcoderProblemsClient, CreateContestInput } from "./clients/atcoder-problems-client";
import { DiscordClient } from "./clients/discord-clients";
import { logger } from "./utils/logger";
import { ProblemPicker } from "./clients/problem-picker";
import { AppError, errors } from "./utils/error";

export const handler: Handler = async (_event) => {
  try {
    const env = envs.parse(process.env);
    const acpClient = new AtcoderProblemsClient(env.acpBaseEndpoint, env.githubToken);
    const discordClient = new DiscordClient(env.discordWebhookUrl);
    const contestBaseUrl = acpClient.getVirtualContestBaseEndpoint();

    const contests = await acpClient.getUpcomingContest(env.searchMinute);
    const targetContests = getUpcomingTargetContests(env.targetContests, contests, contestBaseUrl);

    // 開催されるなら作らないで終了
    if (targetContests.length !== 0) {
      const texts = ["本日は以下のバチャコンが開催されます！"];
      targetContests.forEach((item) => {
        texts.push(`${item.title}：${item.url}`);
      });
      logger.info({ texts });
      await discordClient.postMesage(texts.join("\n"));
      return getResponse({ result: "ok" }, 200);
    }

    const problemJson = await acpClient.getPromblemsJson();
    const problemModelJson = await acpClient.getProblemsModelJson();
    // 環境変数に設定されたdiff情報から問題抽出
    const problemsPicker = new ProblemPicker(problemJson, problemModelJson);
    const problems = problemsPicker.pickProblems(env.problemDiffiSet);

    // 作成
    const setJaForMemo = env.problemDiffiSet.map((item) => charToKanji(item));
    const createBody: CreateContestInput = {
      duration_second: env.createContestDuration,
      is_public: env.createContestPublic,
      memo: `いつも参加しているコンテストが開催されない日のための代替コンテストです。ABCのみ、試験管なし。\n全${setJaForMemo.length}問：${setJaForMemo.join(",")}`,
      mode: null,
      penalty_second: 300,
      start_epoch_second: get21JSTEpoch(),
      title: env.createContestTitle,
    };
    const createId = await acpClient.createContest(createBody, problems);

    const texts = ["本日はバチャコン開催されないので作りました！"];
    texts.push(`${env.createContestTitle}：${contestBaseUrl}/${createId}`);
    await discordClient.postMesage(texts.join("\n"));
    return getResponse({ result: "ok" }, 200);
  } catch (e) {
    console.error(e);
    if (e instanceof AppError) {
      return getResponse({ result: "error", message: e.message }, e.status);
    }
    const error = errors.internal();
    return getResponse({ result: "error", msg: error.name }, error.status);
  }
};
