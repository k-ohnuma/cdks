import { LineMessagingClient } from "../../clients/line-messaging-client";
import { createSetupStateApiHandler } from "../interface/setup-state-api-handler";
import { NotifySetupState } from "../usecase/notify-setup-state";
import { parseLineMessagingConfig } from "./config";

const config = parseLineMessagingConfig(process.env);
const lineMessagingClient = new LineMessagingClient(config.lineChannelAccessToken, config.lineSendUserIds);
const usecase = new NotifySetupState([lineMessagingClient]);

export const handler = createSetupStateApiHandler(usecase);
