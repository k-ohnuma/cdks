import { DrinkEventRepository } from "../../lib/meow-hydration/domain/drink-event-repository";
import { ProcessHydrationEvent } from "../../lib/meow-hydration/usecase/process-hydration-event";
import { MessageSender } from "../../lib/shared/messaging/message-sender";

describe("ProcessHydrationEvent", () => {
  const repository: DrinkEventRepository = {
    save: jest.fn(async () => {}),
    findByOccurredAtRange: jest.fn(async () => []),
  };
  const messageSender: MessageSender = {
    postMessage: jest.fn(async () => {}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("stores a drink event", async () => {
    const usecase = new ProcessHydrationEvent(repository, [messageSender]);
    const event = {
      timestamp: "2026-08-25T08:31:00+0900",
      type: "DRINK" as const,
      amountMl: 18.2,
    };

    await expect(usecase.execute(event)).resolves.toStrictEqual({ stored: true });
    expect(repository.save).toHaveBeenCalledWith(event);
    expect(messageSender.postMessage).toHaveBeenCalledWith(
      "水を飲んでくれたようです！\n時間: 2026-08-25T08:31:00+0900\n飲水量: 18.2ml",
    );
  });

  it("does not store a refill event", async () => {
    const usecase = new ProcessHydrationEvent(repository, [messageSender]);

    await expect(usecase.execute({ timestamp: "2026-08-25T08:31:00+0900", type: "REFILL" })).resolves.toStrictEqual({
      stored: false,
    });
    expect(repository.save).not.toHaveBeenCalled();
    expect(messageSender.postMessage).toHaveBeenCalledWith("水が補給されました！\n時間: 2026-08-25T08:31:00+0900");
  });
});
