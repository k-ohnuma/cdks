import { parseVirtualContestConfig } from "../../lib/virtual-contest/bootstrap/config";

describe("parseVirtualContestConfig", () => {
  it("parses environment variables and applies defaults", () => {
    const config = parseVirtualContestConfig({
      ACP_BASE_ENDPOINT: "https://example.com",
      CREATE_CONTEST_TITLE: "代替コン",
      TARGET_CONTESTS: " まよコン,ヒューリックコンテスト ",
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/example",
      GITHUB_TOKEN: "token",
    });

    expect(config).toStrictEqual({
      acpBaseEndpoint: "https://example.com",
      createContestTitle: "代替コン",
      targetContestNames: ["まよコン", "ヒューリックコンテスト"],
      discordWebhookUrl: "https://discord.com/api/webhooks/example",
      githubToken: "token",
      searchMinute: 15,
      createContestPublic: true,
      createContestDuration: 6000,
      problemDifficulties: ["hai", "cha", "cha", "midori", "midori", "mizu", "mizu", "ao"],
    });
  });

  it("rejects an unknown problem difficulty", () => {
    expect(() =>
      parseVirtualContestConfig({
        ACP_BASE_ENDPOINT: "https://example.com",
        CREATE_CONTEST_TITLE: "代替コン",
        TARGET_CONTESTS: "まよコン",
        DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/example",
        GITHUB_TOKEN: "token",
        PROBLEM_DIFFI_SET: "hai,unknown",
      }),
    ).toThrow();
  });
});
