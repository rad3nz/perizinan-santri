import { expect, test } from "bun:test";
import { TERMINAL_STATUSES, TRANSITIONS } from "./transitions";

test("approve-muaddib: menunggu_muaddib → menunggu_mudir, actor muaddib", () => {
  expect(TRANSITIONS["approve-muaddib"]).toEqual({
    from: "menunggu_muaddib",
    to: "menunggu_mudir",
    actor: "muaddib",
  });
});

test("reject-muaddib: menunggu_muaddib → ditolak_muaddib, actor muaddib", () => {
  expect(TRANSITIONS["reject-muaddib"]).toEqual({
    from: "menunggu_muaddib",
    to: "ditolak_muaddib",
    actor: "muaddib",
  });
});

test("approve-mudir: menunggu_mudir → disetujui, actor mudir", () => {
  expect(TRANSITIONS["approve-mudir"]).toEqual({
    from: "menunggu_mudir",
    to: "disetujui",
    actor: "mudir",
  });
});

test("reject-mudir: menunggu_mudir → ditolak_mudir, actor mudir", () => {
  expect(TRANSITIONS["reject-mudir"]).toEqual({
    from: "menunggu_mudir",
    to: "ditolak_mudir",
    actor: "mudir",
  });
});

test("berangkat: disetujui → berangkat, actor owner", () => {
  expect(TRANSITIONS.berangkat).toEqual({ from: "disetujui", to: "berangkat", actor: "owner" });
});

test("kembali: berangkat → kembali, actor owner", () => {
  expect(TRANSITIONS.kembali).toEqual({ from: "berangkat", to: "kembali", actor: "owner" });
});

test("terminal statuses are exactly the dead-end states", () => {
  expect([...TERMINAL_STATUSES].sort()).toEqual(["ditolak_muaddib", "ditolak_mudir", "kembali"]);
});

test("no transition leaves a terminal status (invariant: states never move backward)", () => {
  const froms = new Set(Object.values(TRANSITIONS).map((t) => t.from));
  for (const s of TERMINAL_STATUSES) {
    expect(froms.has(s)).toBe(false);
  }
});
