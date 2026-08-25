import { DrinkEvent } from "./hydration-event";

export type DrinkSummary = {
  count: number;
  totalMl: number;
  minMl: number | null;
  maxMl: number | null;
  averageMl: number | null;
};

const roundMl = (value: number): number => Number(value.toFixed(2));

export const summarizeDrinkEvents = (events: DrinkEvent[]): DrinkSummary => {
  if (events.length === 0) {
    return { count: 0, totalMl: 0, minMl: null, maxMl: null, averageMl: null };
  }

  const amounts = events.map((event) => event.amountMl);
  const totalMl = amounts.reduce((sum, amountMl) => sum + amountMl, 0);

  return {
    count: events.length,
    totalMl: roundMl(totalMl),
    minMl: roundMl(Math.min(...amounts)),
    maxMl: roundMl(Math.max(...amounts)),
    averageMl: roundMl(totalMl / events.length),
  };
};
