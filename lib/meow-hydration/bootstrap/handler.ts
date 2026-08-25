import { LineMessagingClient } from "../../clients/line-messaging-client";
import { createApiHandler } from "../interface/api-handler";
import { DynamoDbDrinkEventRepository } from "../infrastructure/dynamodb-drink-event-repository";
import { ProcessHydrationEvent } from "../usecase/process-hydration-event";
import { parseMeowHydrationConfig } from "./config";

const config = parseMeowHydrationConfig(process.env);
const repository = new DynamoDbDrinkEventRepository(config.tableName);
const lineMessagingClient = new LineMessagingClient(config.lineChannelAccessToken, config.lineSendUserIds);
const usecase = new ProcessHydrationEvent(repository, [lineMessagingClient]);

export const handler = createApiHandler(usecase);
