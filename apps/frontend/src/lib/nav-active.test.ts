import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./nav-active";

describe("isNavItemActive", () => {
  it("highlights Buat Perizinan only on its exact route", () => {
    expect(isNavItemActive("/santri/perizinan/baru", "/santri/perizinan/baru")).toBe(true);
    expect(isNavItemActive("/santri/perizinan", "/santri/perizinan/baru")).toBe(false);
  });
  it("highlights Riwayat on the list and detail pages but not on /baru", () => {
    expect(isNavItemActive("/santri/perizinan", "/santri/perizinan")).toBe(true);
    expect(isNavItemActive("/santri/perizinan/12", "/santri/perizinan")).toBe(true);
    expect(isNavItemActive("/santri/perizinan/baru", "/santri/perizinan")).toBe(false);
  });
  it("matches exact dashboard routes", () => {
    expect(isNavItemActive("/santri/dashboard", "/santri/dashboard")).toBe(true);
    expect(isNavItemActive("/santri/perizinan", "/santri/dashboard")).toBe(false);
  });
});
