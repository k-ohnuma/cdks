import { parseMeowHydrationConfig } from "../../lib/meow-hydration/bootstrap/config";

describe("meow hydration config", () => {
  it("parses the table name", () => {
    expect(parseMeowHydrationConfig({ TABLE_NAME: "hydration-table" })).toStrictEqual({
      tableName: "hydration-table",
    });
  });
});
