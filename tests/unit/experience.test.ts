import { describe, expect, it } from "vitest";
import { experienceDates, monthsWorked, professionalMonths, splitMonths, yearOf } from "@/lib/experience";
import en from "../../messages/en.json";
import es from "../../messages/es.json";

const NOW = new Date(2026, 10, 5); // November 2026

describe("experience dates", () => {
  it("counts both the first and the last month", () => {
    expect(monthsWorked({ start: "2024-05", end: "2024-10" })).toBe(6);
    expect(monthsWorked({ start: "2023-09", end: "2023-10" })).toBe(2);
  });

  it("counts a current role up to this month", () => {
    expect(monthsWorked({ start: "2025-05", end: null }, NOW)).toBe(19);
  });

  it("leaves training programmes out of professional experience", () => {
    // 19 (current) + 6 + 2; Holberton (training) is excluded.
    expect(professionalMonths(experienceDates, NOW)).toBe(27);
    expect(splitMonths(27)).toEqual({ years: 2, months: 3 });
  });

  it("reads the year a role started", () => {
    expect(yearOf("2023-09")).toBe(2023);
  });

  it("has text for every role in both languages, in the same order", () => {
    const ids = experienceDates.map((entry) => entry.id);
    expect(es.experience.items.map((item) => item.id)).toEqual(ids);
    expect(en.experience.items.map((item) => item.id)).toEqual(ids);
  });
});
