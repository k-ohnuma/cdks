import { problemModelsJson } from "../../lib/clients/atcoder-problems-client";

describe("AtCoder problem model schema", () => {
  it("preserves zero difficulty", () => {
    expect(
      problemModelsJson.parse({
        abc001_a: { difficulty: 0, is_experimental: false },
      }),
    ).toStrictEqual({
      abc001_a: { difficulty: 0, is_experimental: false },
    });
  });
});
