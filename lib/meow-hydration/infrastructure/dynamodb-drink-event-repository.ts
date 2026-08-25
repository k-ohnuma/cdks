import { DynamoDBClient, DynamoDBServiceException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Logger } from "pino";
import { errors } from "../../shared/errors/app-error";
import { formatJstDatetime } from "../../shared/datetime/clock";
import { logger as defaultLogger } from "../../shared/logging/logger";
import { DrinkEventRepository } from "../domain/drink-event-repository";
import { DrinkEvent } from "../domain/hydration-event";

const WATER_SOURCE_ID = "WATER#01";

export class DynamoDbDrinkEventRepository implements DrinkEventRepository {
  constructor(
    private readonly tableName: string,
    private readonly client: DynamoDBDocument = DynamoDBDocument.from(new DynamoDBClient({})),
    private readonly logger: Logger = defaultLogger,
  ) {}

  async save(event: DrinkEvent): Promise<void> {
    try {
      await this.client.put({
        TableName: this.tableName,
        Item: {
          waterSourceId: WATER_SOURCE_ID,
          occurredAt: formatJstDatetime(event.timestamp),
          type: event.type,
          amountMl: event.amountMl,
        },
      });
    } catch (error) {
      this.logger.error({ err: error, type: "dynamodb" });

      if (
        error instanceof DynamoDBServiceException &&
        (error.name === "ProvisionedThroughputExceededException" || error.name === "ThrottlingException")
      ) {
        throw errors.rateLimited({ msg: "DynamoDB throttled", type: "dynamodb" });
      }

      throw errors.internal({ msg: "Failed to save drink event", type: "dynamodb" });
    }
  }

  async findByOccurredAtRange(fromInclusive: string, toInclusive: string): Promise<DrinkEvent[]> {
    try {
      const events: DrinkEvent[] = [];
      let exclusiveStartKey: Record<string, unknown> | undefined;

      do {
        const result = await this.client.query({
          TableName: this.tableName,
          KeyConditionExpression: "#waterSourceId = :waterSourceId AND #occurredAt BETWEEN :from AND :to",
          FilterExpression: "#type = :type",
          ExpressionAttributeNames: {
            "#waterSourceId": "waterSourceId",
            "#occurredAt": "occurredAt",
            "#type": "type",
          },
          ExpressionAttributeValues: {
            ":waterSourceId": WATER_SOURCE_ID,
            ":from": fromInclusive,
            ":to": toInclusive,
            ":type": "DRINK",
          },
          ExclusiveStartKey: exclusiveStartKey,
        });

        events.push(
          ...(result.Items ?? []).map((item) => ({
            timestamp: String(item.occurredAt),
            type: "DRINK" as const,
            amountMl: Number(item.amountMl),
          })),
        );
        exclusiveStartKey = result.LastEvaluatedKey;
      } while (exclusiveStartKey);

      return events;
    } catch (error) {
      this.logger.error({ err: error, type: "dynamodb" });

      if (
        error instanceof DynamoDBServiceException &&
        (error.name === "ProvisionedThroughputExceededException" || error.name === "ThrottlingException")
      ) {
        throw errors.rateLimited({ msg: "DynamoDB throttled", type: "dynamodb" });
      }

      throw errors.internal({ msg: "Failed to query drink events", type: "dynamodb" });
    }
  }
}
