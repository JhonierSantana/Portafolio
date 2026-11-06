import { describe, expect, it } from "vitest";
import { withDwell } from "@/hooks/use-focus-position";

describe("withDwell", () => {
  it("holds still around each item", () => {
    expect(withDwell(0)).toBe(0);
    expect(withDwell(0.2)).toBe(0);
    expect(withDwell(0.8)).toBe(1);
    expect(withDwell(2.1)).toBe(2);
  });

  it("only travels between two items, and reaches the next one", () => {
    expect(withDwell(0.5)).toBeCloseTo(0.5, 5);
    expect(withDwell(0.65)).toBe(1);
    expect(withDwell(0.4)).toBeGreaterThan(0);
    expect(withDwell(0.6)).toBeLessThan(1);
  });

  it("never goes backwards as the visitor keeps scrolling down", () => {
    let previous = withDwell(-0.5);
    for (let position = -0.5; position <= 3.5; position += 0.01) {
      const current = withDwell(position);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });
});
