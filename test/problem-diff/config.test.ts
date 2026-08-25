import { parseProblemDiffApiConfig, parseProblemDiffSyncConfig } from "../../lib/problem-diff/bootstrap/config";

describe("problem difficulty config", () => {
  it("parses API config", () => {
    expect(parseProblemDiffApiConfig({ TABLE_NAME: "problem-difficulty" })).toStrictEqual({
      tableName: "problem-difficulty",
    });
  });

  it("parses sync config and applies defaults", () => {
    expect(
      parseProblemDiffSyncConfig({
        TABLE_NAME: "problem-difficulty",
        ACP_BASE_ENDPOINT: "https://example.com",
      }),
    ).toStrictEqual({
      tableName: "problem-difficulty",
      acpBaseEndpoint: "https://example.com",
      writeConcurrency: 15,
      writeIntervalMs: 500,
    });
  });
});
