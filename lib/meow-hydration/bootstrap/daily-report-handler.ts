import { LineMessagingClient } from "../../clients/line-messaging-client";
import { EventBridgeEvent } from "aws-lambda";
import { DynamoDbDrinkEventRepository } from "../infrastructure/dynamodb-drink-event-repository";
import { SendDailyHydrationReport } from "../usecase/send-daily-hydration-report";
import { parseMeowHydrationConfig } from "./config";

const config = parseMeowHydrationConfig(process.env);
const repository = new DynamoDbDrinkEventRepository(config.tableName);
const lineMessagingClient = new LineMessagingClient(config.lineChannelAccessToken, config.lineSendUserIds);
const usecase = new SendDailyHydrationReport(repository, [lineMessagingClient]);

export const handler = (event: EventBridgeEvent<"Scheduled Event", Record<string, never>>) => {
  return usecase.execute({ reportAt: event.time });
};
