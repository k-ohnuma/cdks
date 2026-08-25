import { APIGatewayEvent } from "aws-lambda";
import { createApiHandler } from "../../lib/vsnip/interface/api-handler";
import { CreateVsnipInputPort } from "../../lib/vsnip/usecase/create-vsnip";

const createEvent = (body: unknown): APIGatewayEvent => {
  return { body: JSON.stringify(body), headers: {} } as APIGatewayEvent;
};

describe("vsnip API handler", () => {
  it("passes validated input to the usecase", async () => {
    const usecase: CreateVsnipInputPort = {
      execute: jest.fn(() => ({
        main: {
          prefix: "main",
          body: ["fn main() {}"],
          description: "Rust main function",
        },
      })),
    };
    const handler = createApiHandler(usecase);

    const response = await handler(
      createEvent({
        title: "main",
        prefix: "main",
        body: "fn main() {}",
        description: "Rust main function",
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(usecase.execute).toHaveBeenCalledWith({
      title: "main",
      prefix: "main",
      body: "fn main() {}",
      description: "Rust main function",
    });
  });

  it("returns a validation error for an empty title", async () => {
    const usecase: CreateVsnipInputPort = { execute: jest.fn() };
    const handler = createApiHandler(usecase);

    const response = await handler(
      createEvent({
        title: " ",
        prefix: "main",
        body: "fn main() {}",
        description: "Rust main function",
      }),
    );

    expect(response.statusCode).toBe(400);
    expect(usecase.execute).not.toHaveBeenCalled();
  });
});
