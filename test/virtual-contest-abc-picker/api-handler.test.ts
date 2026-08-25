import { APIGatewayEvent } from "aws-lambda";
import { CreateContestFromRangeInputPort } from "../../lib/virtual-contest-abc-picker/usecase/create-contest-from-range";
import { createApiHandler } from "../../lib/virtual-contest-abc-picker/interface/api-handler";

const createEvent = (body: unknown, authorization?: string): APIGatewayEvent => {
  return {
    body: JSON.stringify(body),
    headers: authorization ? { Authorization: authorization } : {},
  } as APIGatewayEvent;
};

describe("virtual contest ABC picker API handler", () => {
  it("passes validated input and the bearer token to the usecase", async () => {
    const usecase: CreateContestFromRangeInputPort = {
      execute: jest.fn(async () => ({ id: "contest-1", url: "https://example.com/contest/contest-1" })),
    };
    const handler = createApiHandler(usecase);

    const response = await handler(
      createEvent(
        {
          start: 300,
          end: 400,
          colors: ["hai", "cha"],
          startEpochSecond: 1_700_000_000,
          durationSecond: 7200,
          isPublic: true,
          title: "ABC 300-400",
          mode: "normal",
        },
        "Bearer github-token",
      ),
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({ url: "https://example.com/contest/contest-1" });
    expect(usecase.execute).toHaveBeenCalledWith({
      accessToken: "github-token",
      start: 300,
      end: 400,
      colors: ["hai", "cha"],
      startEpochSecond: 1_700_000_000,
      durationSecond: 7200,
      isPublic: true,
      title: "ABC 300-400",
      mode: "normal",
    });
  });

  it("returns unauthorized when the bearer token is missing", async () => {
    const usecase: CreateContestFromRangeInputPort = {
      execute: jest.fn(),
    };
    const handler = createApiHandler(usecase);

    const response = await handler(
      createEvent({
        start: 300,
        end: 400,
        colors: ["hai"],
        startEpochSecond: 1_700_000_000,
        durationSecond: 7200,
        isPublic: true,
        title: "ABC 300-400",
        mode: "normal",
      }),
    );

    expect(response.statusCode).toBe(401);
    expect(usecase.execute).not.toHaveBeenCalled();
  });
});
