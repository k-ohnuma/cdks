export interface MessageSender {
  postMessage(message: string): Promise<void>;
}
