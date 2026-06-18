import { describe, expect, it } from "vitest";
import { formatRupiah, formatTanggal } from "./format";

describe("format", () => {
  it("formats an ISO date as DD MMM YYYY (id-ID)", () => {
    expect(formatTanggal("2025-01-15")).toMatch(/15 Jan 2025/);
  });
  it("formats rupiah with id-ID grouping", () => {
    expect(formatRupiah(1000)).toBe("Rp 1.000");
  });
});
