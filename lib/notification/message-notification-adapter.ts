import { MessageSender } from "../clients/message-sender";
import { Notification, NotificationPort } from "./notification-port";

export class MessageNotificationAdapter implements NotificationPort {
  constructor(private readonly messageSender: MessageSender) {}

  async send(notification: Notification): Promise<void> {
    const message = [`[${notification.severity.toUpperCase()}] ${notification.title}`, notification.message].join("\n");
    await this.messageSender.postMessage(message);
  }
}
