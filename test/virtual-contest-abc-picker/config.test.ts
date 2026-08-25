import { parseVirtualContestAbcPickerConfig } from "../../lib/virtual-contest-abc-picker/bootstrap/config";

describe("parseVirtualContestAbcPickerConfig", () => {
  it("parses the AtCoder Problems endpoint", () => {
    expect(parseVirtualContestAbcPickerConfig({ ACP_BASE_ENDPOINT: "https://example.com" })).toStrictEqual({
      acpBaseEndpoint: "https://example.com",
    });
  });

  it("rejects an invalid endpoint", () => {
    expect(() => parseVirtualContestAbcPickerConfig({ ACP_BASE_ENDPOINT: "example.com" })).toThrow();
  });
});
