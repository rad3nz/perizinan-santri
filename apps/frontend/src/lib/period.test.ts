import { describe, expect, it } from "vitest";
import { monthRange, yearOptions } from "./period";

describe("period", () => {
  it("monthRange returns first/last day of a 31-day month", () => {
    expect(monthRange("2026", "6")).toEqual({ dateFrom: "2026-06-01", dateTo: "2026-06-30" });
  });
  it("monthRange handles February (non-leap year)", () => {
    expect(monthRange("2026", "2")).toEqual({ dateFrom: "2026-02-01", dateTo: "2026-02-28" });
  });
  it("monthRange with null month spans the whole year", () => {
    expect(monthRange("2026", null)).toEqual({ dateFrom: "2026-01-01", dateTo: "2026-12-31" });
  });
  it("yearOptions returns a ±5 year range around now", () => {
    const values = yearOptions(new Date("2026-06-19")).map((o) => o.value);
    expect(values).toEqual([
      "2021",
      "2022",
      "2023",
      "2024",
      "2025",
      "2026",
      "2027",
      "2028",
      "2029",
      "2030",
      "2031",
    ]);
    expect(values).toHaveLength(11);
  });
});
