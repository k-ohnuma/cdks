export type DrinkEvent = {
  timestamp: string;
  type: "DRINK";
  amountMl: number;
};

export type RefillEvent = {
  timestamp: string;
  type: "REFILL";
};

export type HydrationEvent = DrinkEvent | RefillEvent;
