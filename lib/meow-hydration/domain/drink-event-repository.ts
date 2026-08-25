import { DrinkEvent } from "./hydration-event";

export interface DrinkEventRepository {
  save(event: DrinkEvent): Promise<void>;
  findByOccurredAtRange(fromInclusive: string, toInclusive: string): Promise<DrinkEvent[]>;
}
