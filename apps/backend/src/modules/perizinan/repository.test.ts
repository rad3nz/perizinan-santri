import { beforeAll, expect, test } from "bun:test";
import { usersRepo } from "../users/repository";
import { perizinanRepo } from "./repository";

let santri1Id: number;
let muaddib1: { id: number; role: "muaddib"; kamarId: number | null };
let mudir: { id: number; role: "mudir"; kamarId: number | null };

beforeAll(async () => {
  const s = await usersRepo.findByUsername("santri1");
  const m = await usersRepo.findByUsername("muaddib1");
  const md = await usersRepo.findByUsername("mudir");
  if (!s || !m || !md) {
    throw new Error("Seed belum dijalankan (santri1/muaddib1/mudir tidak ditemukan).");
  }
  santri1Id = s.id;
  muaddib1 = { id: m.id, role: "muaddib", kamarId: m.kamarId };
  mudir = { id: md.id, role: "mudir", kamarId: md.kamarId };
});

test("santri sees only their own rows", async () => {
  const { items } = await perizinanRepo.list(
    { id: santri1Id, role: "santri", kamarId: muaddib1.kamarId },
    { page: 1, limit: 100 },
  );
  expect(items.every((r) => r.userId === santri1Id)).toBe(true);
});

test("mudir never sees menunggu_muaddib rows", async () => {
  const { items } = await perizinanRepo.list(mudir, { page: 1, limit: 100 });
  expect(items.some((r) => r.status === "menunggu_muaddib")).toBe(false);
});

test("muaddib sees only their kamar", async () => {
  const { items } = await perizinanRepo.list(muaddib1, { page: 1, limit: 100 });
  expect(items.every((r) => r.santri.kamar?.id === muaddib1.kamarId)).toBe(true);
});

test("filters by tanggalKeluar date range", async () => {
  const wide = await perizinanRepo.list(mudir, { page: 1, limit: 100 });
  const first = wide.items[0];
  if (!first) return; // no seed rows visible to mudir; nothing to assert
  const pivot = String(first.tanggalKeluar).slice(0, 10);
  const { items } = await perizinanRepo.list(mudir, {
    page: 1,
    limit: 100,
    dateFrom: pivot,
    dateTo: pivot,
  });
  expect(items.every((r) => String(r.tanggalKeluar).slice(0, 10) === pivot)).toBe(true);
});
