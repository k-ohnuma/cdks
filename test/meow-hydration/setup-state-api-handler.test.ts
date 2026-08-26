import { APIGatewayEvent } from "aws-lambda";
import { createSetupStateApiHandler } from "../../lib/meow-hydration/interface/setup-state-api-handler";
import { NotifySetupStateInputPort } from "../../lib/meow-hydration/usecase/notify-setup-state";

const createEvent = (body: unknown): APIGatewayEvent =>
  ({ body: JSON.stringify(body), headers: {} }) as APIGatewayEvent;

describe("setup state API handler", () => {
  it("passes a valid state to the usecase", async () => {
    const usecase: NotifySetupStateInputPort = {
      execute: jest.fn(async (state) => ({ notified: true as const, state })),
    };
    const handler = createSetupStateApiHandler(usecase);

    const response = await handler(createEvent({ state: "WAITING_FOR_BOWL" }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({ notified: true, state: "WAITING_FOR_BOWL" });
    expect(usecase.execute).toHaveBeenCalledWith("WAITING_FOR_BOWL");
  });

  it("rejects an unknown state", async () => {
    const usecase: NotifySetupStateInputPort = { execute: jest.fn() };
    const handler = createSetupStateApiHandler(usecase);

    const response = await handler(createEvent({ state: "UNKNOWN" }));

    expect(response.statusCode).toBe(400);
    expect(usecase.execute).not.toHaveBeenCalled();
  });
});
