import { APIGatewayEvent } from "aws-lambda";
import { createApiHandler } from "../../lib/problem-diff/interface/api-handler";
import { GetProblemDifficultyInputPort } from "../../lib/problem-diff/usecase/get-problem-difficulty";

const createEvent = (problemId?: string): APIGatewayEvent => {
  return {
    headers: {},
    queryStringParameters: problemId === undefined ? null : { problemId },
  } as APIGatewayEvent;
};

describe("problem difficulty API handler", () => {
  it("returns the requested problem difficulty", async () => {
    const usecase: GetProblemDifficultyInputPort = {
      execute: jest.fn(async () => ({ problemId: "abc001_a", difficulty: 147 })),
    };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent("abc001_a"));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({ problemId: "abc001_a", difficulty: 147 });
    expect(usecase.execute).toHaveBeenCalledWith("abc001_a");
  });

  it("returns validation error when problemId is missing", async () => {
    const usecase: GetProblemDifficultyInputPort = { execute: jest.fn() };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent());

    expect(response.statusCode).toBe(400);
    expect(usecase.execute).not.toHaveBeenCalled();
  });

  it("returns not found when no record exists", async () => {
    const usecase: GetProblemDifficultyInputPort = { execute: jest.fn(async () => undefined) };
    const handler = createApiHandler(usecase);

    const response = await handler(createEvent("abc999_z"));

    expect(response.statusCode).toBe(404);
  });
});
