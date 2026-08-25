import { summarizeDrinkEvents } from "../../lib/meow-hydration/domain/drink-summary";

describe("summarizeDrinkEvents", () => {
  it("calculates drink statistics", () => {
    expect(
      summarizeDrinkEvents([
        { timestamp: "a", type: "DRINK", amountMl: 10.1 },
        { timestamp: "b", type: "DRINK", amountMl: 18.2 },
        { timestamp: "c", type: "DRINK", amountMl: 30.3 },
      ]),
    ).toStrictEqual({
      count: 3,
      totalMl: 58.6,
      minMl: 10.1,
      maxMl: 30.3,
      averageMl: 19.53,
    });
  });

  it("returns nullable statistics when there are no events", () => {
    expect(summarizeDrinkEvents([])).toStrictEqual({
      count: 0,
      totalMl: 0,
      minMl: null,
      maxMl: null,
      averageMl: null,
    });
  });
});
