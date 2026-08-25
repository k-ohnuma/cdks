import { MessageSender } from "../../lib/clients/message-sender";
import { MessageNotificationAdapter } from "../../lib/shared/notification/message-notification-adapter";

describe("MessageNotificationAdapter", () => {
  it("formats a notification and delegates it to the message sender", async () => {
    const messageSender: MessageSender = {
      postMessage: jest.fn(async () => {}),
    };
    const adapter = new MessageNotificationAdapter(messageSender);

    await adapter.send({
      title: "Health check failed",
      message: "url: https://example.com/health, statusCode: 503",
      severity: "error",
    });

    expect(messageSender.postMessage).toHaveBeenCalledWith(
      "[ERROR] Health check failed\nurl: https://example.com/health, statusCode: 503",
    );
  });
});
