import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDbDrinkEventRepository } from "../../lib/meow-hydration/infrastructure/dynamodb-drink-event-repository";

describe("DynamoDbDrinkEventRepository", () => {
  it("maps a drink event to the hydration table item", async () => {
    const client = {
      put: jest.fn(async () => ({})),
    } as unknown as DynamoDBDocument;
    const repository = new DynamoDbDrinkEventRepository("hydration-table", client);

    await repository.save({
      timestamp: "2026-08-25T08:31:00+0900",
      type: "DRINK",
      amountMl: 18.2,
    });

    expect(client.put).toHaveBeenCalledWith({
      TableName: "hydration-table",
      Item: {
        waterSourceId: "WATER#01",
        occurredAt: "2026-08-25T08:31:00+0900",
        type: "DRINK",
        amountMl: 18.2,
      },
    });
  });

  it("queries drink events in the specified range", async () => {
    const client = {
      query: jest.fn(async () => ({
        Items: [
          {
            waterSourceId: "WATER#01",
            occurredAt: "2026-08-25T08:31:00+0900",
            type: "DRINK",
            amountMl: 18.2,
          },
          {
            waterSourceId: "WATER#01",
            occurredAt: "2026-08-26T00:00:00+0900",
            type: "DRINK",
            amountMl: 20,
          },
        ],
      })),
    } as unknown as DynamoDBDocument;
    const repository = new DynamoDbDrinkEventRepository("hydration-table", client);

    await expect(
      repository.findByOccurredAtRange("2026-08-25T00:00:00+0900", "2026-08-26T00:00:00+0900"),
    ).resolves.toStrictEqual([
      {
        timestamp: "2026-08-25T08:31:00+0900",
        type: "DRINK",
        amountMl: 18.2,
      },
      {
        timestamp: "2026-08-26T00:00:00+0900",
        type: "DRINK",
        amountMl: 20,
      },
    ]);
    expect(client.query).toHaveBeenCalledWith({
      TableName: "hydration-table",
      KeyConditionExpression: "#waterSourceId = :waterSourceId AND #occurredAt BETWEEN :from AND :to",
      FilterExpression: "#type = :type",
      ExpressionAttributeNames: {
        "#waterSourceId": "waterSourceId",
        "#occurredAt": "occurredAt",
        "#type": "type",
      },
      ExpressionAttributeValues: {
        ":waterSourceId": "WATER#01",
        ":from": "2026-08-25T00:00:00+0900",
        ":to": "2026-08-26T00:00:00+0900",
        ":type": "DRINK",
      },
      ExclusiveStartKey: undefined,
    });
  });
});
