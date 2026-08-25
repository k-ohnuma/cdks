import { DrinkEventRepository } from "../../lib/meow-hydration/domain/drink-event-repository";
import { SendDailyHydrationReport } from "../../lib/meow-hydration/usecase/send-daily-hydration-report";
import { MessageSender } from "../../lib/shared/messaging/message-sender";

describe("SendDailyHydrationReport", () => {
  it("queries the previous 24 hours from the EventBridge time and sends its summary", async () => {
    const repository: DrinkEventRepository = {
      save: jest.fn(),
      findByOccurredAtRange: jest.fn(async () => [
        { timestamp: "2026-08-25T08:31:00+0900", type: "DRINK" as const, amountMl: 10 },
        { timestamp: "2026-08-25T20:00:00+0900", type: "DRINK" as const, amountMl: 20 },
      ]),
    };
    const messageSender: MessageSender = { postMessage: jest.fn(async () => {}) };
    const usecase = new SendDailyHydrationReport(repository, [messageSender]);

    await expect(usecase.execute({ reportAt: "2026-08-25T15:12:34Z" })).resolves.toStrictEqual({
      from: "2026-08-25T00:12:34+0900",
      to: "2026-08-26T00:12:34+0900",
      summary: { count: 2, totalMl: 30, minMl: 10, maxMl: 20, averageMl: 15 },
    });
    expect(repository.findByOccurredAtRange).toHaveBeenCalledWith(
      "2026-08-25T00:12:34+0900",
      "2026-08-26T00:12:34+0900",
    );
    expect(messageSender.postMessage).toHaveBeenCalledWith(
      [
        "【過去24時間の水分補給レポート】",
        "期間: 2026-08-25T00:12:34+0900 - 2026-08-26T00:12:34+0900",
        "飲んだ回数: 2回",
        "合計: 30ml",
        "最小: 10ml",
        "最大: 20ml",
        "平均: 15ml",
      ].join("\n"),
    );
  });

  it("uses dashes for statistics when no drinks were recorded", async () => {
    const repository: DrinkEventRepository = {
      save: jest.fn(),
      findByOccurredAtRange: jest.fn(async () => []),
    };
    const messageSender: MessageSender = { postMessage: jest.fn(async () => {}) };
    const usecase = new SendDailyHydrationReport(repository, [messageSender]);

    await usecase.execute({ reportAt: "2026-08-25T15:00:00Z" });

    expect(messageSender.postMessage).toHaveBeenCalledWith(expect.stringContaining("最小: -\n最大: -\n平均: -"));
  });
});
