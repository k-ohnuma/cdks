import { MessageSender } from "../../shared/messaging/message-sender";
import { getSetupStateMessage, SetupState } from "../domain/setup-state";

export type NotifySetupStateOutput = {
  notified: true;
  state: SetupState;
};

export interface NotifySetupStateInputPort {
  execute(state: SetupState): Promise<NotifySetupStateOutput>;
}

export class NotifySetupState implements NotifySetupStateInputPort {
  constructor(private readonly messageSenders: MessageSender[]) {}

  async execute(state: SetupState): Promise<NotifySetupStateOutput> {
    const message = getSetupStateMessage(state);
    await Promise.all(this.messageSenders.map((sender) => sender.postMessage(message)));
    return { notified: true, state };
  }
}
