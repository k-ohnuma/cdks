import { parseLineMessagingConfig, parseMeowHydrationConfig } from "../../lib/meow-hydration/bootstrap/config";

describe("meow hydration config", () => {
  it("parses the table name and LINE configuration", () => {
    expect(
      parseMeowHydrationConfig({
        TABLE_NAME: "hydration-table",
        LINE_CHANNEL_ACCESS_TOKEN: "token",
        LINE_SEND_USER_IDS: "user-1, user-2",
      }),
    ).toStrictEqual({
      tableName: "hydration-table",
      lineChannelAccessToken: "token",
      lineSendUserIds: ["user-1", "user-2"],
    });
  });

  it("parses LINE configuration without a table name", () => {
    expect(
      parseLineMessagingConfig({
        LINE_CHANNEL_ACCESS_TOKEN: "token",
        LINE_SEND_USER_IDS: "user-1, user-2",
      }),
    ).toStrictEqual({
      lineChannelAccessToken: "token",
      lineSendUserIds: ["user-1", "user-2"],
    });
  });
});
