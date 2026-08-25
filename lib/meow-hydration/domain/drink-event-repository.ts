import { DrinkEvent } from "./hydration-event";

export interface DrinkEventRepository {
  save(event: DrinkEvent): Promise<void>;
}
