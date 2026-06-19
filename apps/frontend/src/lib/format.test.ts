import { describe, expect, it } from "vitest";
import { durationHari, formatRupiah, formatTanggal } from "./format";

describe("format", () => {
  it("formats an ISO date as DD MMM YYYY (id-ID)", () => {
    expect(formatTanggal("2025-01-15")).toMatch(/15 Jan 2025/);
  });
  it("formats rupiah with id-ID grouping", () => {
    expect(formatRupiah(1000)).toBe("Rp 1.000");
  });
});

describe("durationHari", () => {
  it("counts whole days between two dates", () => {
    expect(durationHari("2026-06-18", "2026-06-20")).toBe(2);
  });
  it("is 0 for the same day", () => {
    expect(durationHari("2026-06-18", "2026-06-18")).toBe(0);
  });
  it("never goes negative", () => {
    expect(durationHari("2026-06-20", "2026-06-18")).toBe(0);
  });
});
