import { describe, expect, it } from "vitest";
import { formatCount, parseCount } from "@/lib/count-up";

describe("parseCount", () => {
  it("reads plain and suffixed figures", () => {
    expect(parseCount("4")).toEqual({ target: 4, suffix: "" });
    expect(parseCount("100+")).toEqual({ target: 100, suffix: "+" });
    expect(parseCount(" 2+ ")).toEqual({ target: 2, suffix: "+" });
  });

  it("leaves non-figures alone", () => {
    expect(parseCount("Migración")).toBeNull();
    expect(parseCount("2-4")).toBeNull();
    expect(parseCount("")).toBeNull();
  });
});

describe("formatCount", () => {
  it("rounds while counting and keeps the suffix", () => {
    const target = parseCount("100+")!;
    expect(formatCount(0, target)).toBe("0+");
    expect(formatCount(37.6, target)).toBe("38+");
    expect(formatCount(100, target)).toBe("100+");
  });
});
