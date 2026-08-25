import { DrinkEventRepository } from "../domain/drink-event-repository";
import { HydrationEvent } from "../domain/hydration-event";

export type ProcessHydrationEventOutput = {
  stored: boolean;
};

export interface ProcessHydrationEventInputPort {
  execute(event: HydrationEvent): Promise<ProcessHydrationEventOutput>;
}

export class ProcessHydrationEvent implements ProcessHydrationEventInputPort {
  constructor(private readonly repository: DrinkEventRepository) {}

  async execute(event: HydrationEvent): Promise<ProcessHydrationEventOutput> {
    if (event.type === "REFILL") return { stored: false };

    await this.repository.save(event);
    return { stored: true };
  }
}
