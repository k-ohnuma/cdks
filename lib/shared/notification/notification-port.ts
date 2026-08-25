export type Notification = {
  title: string;
  message: string;
  severity: "info" | "warning" | "error";
};

export interface NotificationPort {
  send(notification: Notification): Promise<void>;
}
