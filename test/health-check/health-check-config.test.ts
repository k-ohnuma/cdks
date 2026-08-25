import { parseHealthCheckConfig } from "../../lib/health-check/bootstrap/config";

describe("parseHealthCheckConfig", () => {
  it("parses and normalizes environment variables", () => {
    const config = parseHealthCheckConfig({
      FETCH_URLS: " https://example.com/health,https://example.com/health,https://example.net/health ",
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/example",
      REQUEST_TIMEOUT_MS: "5000",
    });

    expect(config).toStrictEqual({
      fetchUrls: ["https://example.com/health", "https://example.net/health"],
      discordWebhookUrl: "https://discord.com/api/webhooks/example",
      requestTimeoutMs: 5000,
    });
  });

  it("rejects an empty URL list", () => {
    expect(() => parseHealthCheckConfig({ FETCH_URLS: " , " })).toThrow();
  });

  it("rejects invalid URLs", () => {
    expect(() => parseHealthCheckConfig({ FETCH_URLS: "example.com/health" })).toThrow();
  });
});
