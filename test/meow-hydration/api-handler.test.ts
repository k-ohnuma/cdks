import { APIGatewayEvent } from "aws-lambda";
import { createApiHandler } from "../../lib/meow-hydration/interface/api-handler";
import { ProcessHydrationEventInputPort } from "../../lib/meow-hydration/usecase/process-hydration-event";

const createEvent = (body: unknown): APIGatewayEvent =>
  ({ body: JSON.stringify(body), headers: {} }) as APIGatewayEvent;

describe("meow hydration API handler", () => {
  it("passes a valid drink event to the usecase", async () => {
    const usecase: ProcessHydrationEventInputPort = {
      execute: jest.fn(async () => ({ stored: true })),
    };
    const handler = createApiHandler(usecase);
    const body = {
      timestamp: "2026-08-25T08:31:00+0900",
      type: "DRINK",
      amountMl: 18.2,
    };

    const response = await handler(createEvent(body));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({ stored: true });
    expect(usecase.execute).toHaveBeenCalledWith(body);
  });

  it("rejects a drink event without amountMl", async () => {
    const usecase: ProcessHydrationEventInputPort = { execute: jest.fn() };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent({ timestamp: "2026-08-25T08:31:00+0900", type: "DRINK" }));

    expect(response.statusCode).toBe(400);
    expect(usecase.execute).not.toHaveBeenCalled();
  });

  it("accepts a refill event without amountMl", async () => {
    const usecase: ProcessHydrationEventInputPort = {
      execute: jest.fn(async () => ({ stored: false })),
    };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent({ timestamp: "2026-08-25T08:31:00+0900", type: "REFILL" }));

    expect(response.statusCode).toBe(200);
    expect(usecase.execute).toHaveBeenCalled();
  });

  it("rejects an invalid timestamp", async () => {
    const usecase: ProcessHydrationEventInputPort = { execute: jest.fn() };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent({ timestamp: "not-a-date", type: "DRINK", amountMl: 18.2 }));

    expect(response.statusCode).toBe(400);
    expect(usecase.execute).not.toHaveBeenCalled();
  });
});
