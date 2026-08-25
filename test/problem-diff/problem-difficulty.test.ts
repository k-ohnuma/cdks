import { calculateProblemDifficulty } from "../../lib/problem-diff/domain/problem-difficulty";

describe("calculateProblemDifficulty", () => {
  it.each([
    [0, 147],
    [399, 399],
    [400, 400],
    [1200, 1200],
  ])("converts source difficulty %i to %i", (source, expected) => {
    expect(calculateProblemDifficulty(source)).toBe(expected);
  });
});
