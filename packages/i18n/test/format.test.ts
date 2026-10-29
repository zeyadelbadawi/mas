import { describe, expect, it } from "vitest";
import { formatPrice, formatTime } from "../src/format";
import { loadMessages } from "../src/messages";

describe("format", () => {
  it("uses Western digits in Arabic", () => {
    expect(formatPrice(1250, "ar")).toBe("1,250 ج.م");
    expect(formatPrice(1250, "en")).toBe("EGP 1,250");
    expect(formatTime("19:30", "ar")).toMatch(/^7:30\s?م$/);
    expect(formatTime("09:05", "en")).toMatch(/^9:05\s?AM$/i);
  });
});

describe("loadMessages", () => {
  it("merges app messages over the shared ones", () => {
    const messages = loadMessages("en", { en: { common: { menu: "Our menu" } }, ar: {} }) as Record<
      string,
      Record<string, string>
    >;
    expect(messages.common?.menu).toBe("Our menu");
    expect(messages.common?.close).toBe("Close");
  });
});
