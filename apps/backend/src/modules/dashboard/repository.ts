import { and, eq, gte, inArray, lte, type SQL, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { perizinan, users } from "../../db/schema";

export type Period = { dateFrom?: string; dateTo?: string };

// Period filter on departure date (tanggalKeluar), mirroring the perizinan list filter.
function inPeriod(p?: Period): SQL | undefined {
  const conds: SQL[] = [];
  if (p?.dateFrom) conds.push(gte(perizinan.tanggalKeluar, new Date(p.dateFrom)));
  if (p?.dateTo) conds.push(lte(perizinan.tanggalKeluar, new Date(p.dateTo)));
  return conds.length ? and(...conds) : undefined;
}

async function countPerizinan(where: SQL | undefined) {
  const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(perizinan).where(where);
  return Number(c);
}

async function countSantri(kamarId?: number) {
  const conds: SQL[] = [eq(users.role, "santri")];
  if (kamarId != null) conds.push(eq(users.kamarId, kamarId));
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)` })
    .from(users)
    .where(and(...conds));
  return Number(c);
}

const inKamar = (kamarId: number) =>
  inArray(
    perizinan.userId,
    db.select({ id: users.id }).from(users).where(eq(users.kamarId, kamarId)),
  );

// Distinct santri who currently have an outstanding "berangkat" (departed) permission.
async function countDepartedSantri(kamarId?: number) {
  const conds: SQL[] = [eq(perizinan.status, "berangkat")];
  if (kamarId != null) conds.push(inKamar(kamarId));
  const [{ c }] = await db
    .select({ c: sql<number>`count(distinct ${perizinan.userId})` })
    .from(perizinan)
    .where(and(...conds));
  return Number(c);
}

const kembaliHariIni = sql`${perizinan.tanggalKembaliAktual} = CURDATE()`;

export const dashboardRepo = {
  async staffStats(kamarId?: number, period?: Period) {
    const scope = kamarId != null ? inKamar(kamarId) : undefined;
    const s = (extra: SQL | undefined): SQL | undefined => (scope ? and(scope, extra) : extra);
    const totalSantri = await countSantri(kamarId);
    return {
      totalSantri,
      // Live snapshot: santri currently inside the dormitory (roster minus departed).
      santriDiAsrama: totalSantri - (await countDepartedSantri(kamarId)),
      menungguMuaddib: await countPerizinan(s(eq(perizinan.status, "menunggu_muaddib"))),
      menungguMudir: await countPerizinan(s(eq(perizinan.status, "menunggu_mudir"))),
      // Flow stat: scoped to the selected period by departure date.
      disetujui: await countPerizinan(s(and(eq(perizinan.status, "disetujui"), inPeriod(period)))),
      berangkat: await countPerizinan(s(eq(perizinan.status, "berangkat"))),
      kembaliHariIni: await countPerizinan(s(and(eq(perizinan.status, "kembali"), kembaliHariIni))),
    };
  },
  async santriStats(userId: number, period?: Period) {
    const own = (extra: SQL | undefined) =>
      extra ? and(eq(perizinan.userId, userId), extra) : eq(perizinan.userId, userId);
    return {
      // Flow stats: scoped to the selected period by departure date.
      totalPerizinan: await countPerizinan(own(inPeriod(period))),
      menunggu: await countPerizinan(
        own(inArray(perizinan.status, ["menunggu_muaddib", "menunggu_mudir"])),
      ),
      disetujui: await countPerizinan(own(and(eq(perizinan.status, "disetujui"), inPeriod(period)))),
      berangkat: await countPerizinan(own(eq(perizinan.status, "berangkat"))),
      ditolak: await countPerizinan(
        own(and(inArray(perizinan.status, ["ditolak_muaddib", "ditolak_mudir"]), inPeriod(period))),
      ),
    };
  },
};
