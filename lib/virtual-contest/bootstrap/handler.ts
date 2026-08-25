import "source-map-support/register";

import { Handler } from "aws-lambda";
import { AtcoderProblemsClient } from "../../clients/atcoder-problems-client";
import { DiscordClient } from "../../clients/discord-clients";
import { MessageNotificationAdapter } from "../../notification/message-notification-adapter";
import { logger } from "../../utils/logger";
import { getCurrentEpochSec } from "../../utils/lib";
import { AtCoderVirtualContestAdapter } from "../infrastructure/atcoder-virtual-contest-adapter";
import { RunVirtualContest } from "../usecase/run-virtual-contest";
import { get21JstEpoch } from "../usecase/virtual-contest-rules";
import { parseVirtualContestConfig } from "./config";

const config = parseVirtualContestConfig(process.env);
const contestGateway = new AtCoderVirtualContestAdapter(
  new AtcoderProblemsClient(config.acpBaseEndpoint, config.githubToken),
);
const notifications = [new MessageNotificationAdapter(new DiscordClient(config.discordWebhookUrl))];
const usecase = new RunVirtualContest(contestGateway, notifications);

export const handler: Handler = async () => {
  try {
    return await usecase.execute({
      targetContestNames: config.targetContestNames,
      searchMinute: config.searchMinute,
      createContestTitle: config.createContestTitle,
      createContestPublic: config.createContestPublic,
      createContestDuration: config.createContestDuration,
      problemDifficulties: config.problemDifficulties,
      startEpochSecond: get21JstEpoch(getCurrentEpochSec("sec")),
    });
  } catch (error) {
    logger.error({ err: error });
    throw error;
  }
};
