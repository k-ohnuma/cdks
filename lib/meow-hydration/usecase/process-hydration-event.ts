import { DrinkEventRepository } from "../domain/drink-event-repository";
import { HydrationEvent } from "../domain/hydration-event";
import { MessageSender } from "../../shared/messaging/message-sender";

export type ProcessHydrationEventOutput = {
  stored: boolean;
};

export interface ProcessHydrationEventInputPort {
  execute(event: HydrationEvent): Promise<ProcessHydrationEventOutput>;
}

export class ProcessHydrationEvent implements ProcessHydrationEventInputPort {
  constructor(
    private readonly repository: DrinkEventRepository,
    private readonly messageSenders: MessageSender[],
  ) {}

  async execute(event: HydrationEvent): Promise<ProcessHydrationEventOutput> {
    if (event.type === "REFILL") {
      await this.postMessage(`水が補給されました！\n時間: ${event.timestamp}`);
      return { stored: false };
    }

    await this.repository.save(event);
    await this.postMessage(`水が飲まれたようです！\n時間: ${event.timestamp}\n飲水量: ${event.amountMl}ml`);
    return { stored: true };
  }

  private async postMessage(message: string): Promise<void> {
    await Promise.all(this.messageSenders.map((sender) => sender.postMessage(message)));
  }
}
