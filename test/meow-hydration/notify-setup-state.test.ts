import { SetupState } from "../../lib/meow-hydration/domain/setup-state";
import { NotifySetupState } from "../../lib/meow-hydration/usecase/notify-setup-state";
import { MessageSender } from "../../lib/shared/messaging/message-sender";

describe("NotifySetupState", () => {
  const cases: Array<{ state: SetupState; message: string }> = [
    {
      state: "TARING",
      message: "ゼロ点合わせするため台に何も置かないでください。",
    },
    {
      state: "WAITING_FOR_BOWL",
      message: "ゼロ点取得が完了しました。水皿を置いてください",
    },
    {
      state: "MONITORING",
      message: "水皿の重量が安定しました。監視を開始します",
    },
  ];

  it.each(cases)("sends the message for $state", async ({ state, message }) => {
    const messageSender: MessageSender = { postMessage: jest.fn(async () => {}) };
    const usecase = new NotifySetupState([messageSender]);

    await expect(usecase.execute(state)).resolves.toStrictEqual({ notified: true, state });
    expect(messageSender.postMessage).toHaveBeenCalledWith(message);
  });
});
