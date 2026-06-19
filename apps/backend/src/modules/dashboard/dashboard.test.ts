import { afterAll, beforeAll, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { kamar, perizinan, users } from "../../db/schema";
import { dashboardRepo } from "./repository";

// Self-contained seed: an isolated kamar so staffStats(kamarId) counts are deterministic
// regardless of whatever the shared dev seed contains.
const KAMAR_NAMA = "dash_test_kamar";
const USERNAMES = ["dash_test_a", "dash_test_b", "dash_test_c"];

let kamarId: number;
const userIds: number[] = [];

async function clean() {
  const existing = await db.select({ id: users.id }).from(users).where(inArray(users.username, USERNAMES));
  const ids = existing.map((u) => u.id);
  if (ids.length) {
    await db.delete(perizinan).where(inArray(perizinan.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
  }
  await db.delete(kamar).where(eq(kamar.nama, KAMAR_NAMA));
}

beforeAll(async () => {
  await clean();
  const [k] = await db.insert(kamar).values({ nama: KAMAR_NAMA, kapasitas: 10 }).$returningId();
  kamarId = k.id;

  const pw = await Bun.password.hash("password");
  for (const username of USERNAMES) {
    const [u] = await db
      .insert(users)
      .values({ name: username, username, password: pw, role: "santri", kamarId })
      .$returningId();
    userIds.push(u.id);
  }

  const base = {
    jenisIzin: "pulang" as const,
    tujuan: "test",
    tanggalKembaliRencana: new Date("2099-03-25"),
  };
  // A: currently departed (berangkat). B: approved (disetujui). C: pending muaddib.
  await db.insert(perizinan).values([
    { ...base, userId: userIds[0], status: "berangkat", tanggalKeluar: new Date("2099-03-05") },
    { ...base, userId: userIds[1], status: "disetujui", tanggalKeluar: new Date("2099-03-10") },
    { ...base, userId: userIds[2], status: "menunggu_muaddib", tanggalKeluar: new Date("2099-03-20") },
  ]);
});

afterAll(clean);

test("santriDiAsrama = roster minus santri currently berangkat", async () => {
  const stats = await dashboardRepo.staffStats(kamarId);
  expect(stats.totalSantri).toBe(3);
  expect(stats.santriDiAsrama).toBe(2); // A is departed; B and C are inside
});

test("disetujui is period-scoped by tanggalKeluar; live counts are not", async () => {
  const march = await dashboardRepo.staffStats(kamarId, {
    dateFrom: "2099-03-01",
    dateTo: "2099-03-31",
  });
  expect(march.disetujui).toBe(1);
  expect(march.menungguMuaddib).toBe(1);
  expect(march.berangkat).toBe(1);

  const april = await dashboardRepo.staffStats(kamarId, {
    dateFrom: "2099-04-01",
    dateTo: "2099-04-30",
  });
  expect(april.disetujui).toBe(0); // B's departure is in March → excluded
  expect(april.menungguMuaddib).toBe(1); // live count, unaffected by period
  expect(april.berangkat).toBe(1); // live count, unaffected by period
  expect(april.santriDiAsrama).toBe(2); // snapshot, unaffected by period
});

test("santriStats period-scopes flow stats only", async () => {
  const march = await dashboardRepo.santriStats(userIds[1], {
    dateFrom: "2099-03-01",
    dateTo: "2099-03-31",
  });
  expect(march.totalPerizinan).toBe(1);
  expect(march.disetujui).toBe(1);

  const april = await dashboardRepo.santriStats(userIds[1], {
    dateFrom: "2099-04-01",
    dateTo: "2099-04-30",
  });
  expect(april.totalPerizinan).toBe(0);
  expect(april.disetujui).toBe(0);
});
