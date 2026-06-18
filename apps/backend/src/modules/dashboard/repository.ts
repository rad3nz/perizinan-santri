import { and, eq, inArray, type SQL, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { perizinan, users } from "../../db/schema";

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

const kembaliHariIni = sql`${perizinan.tanggalKembaliAktual} = CURDATE()`;

export const dashboardRepo = {
  async staffStats(kamarId?: number) {
    const scope = kamarId != null ? inKamar(kamarId) : undefined;
    const s = (extra: SQL | undefined): SQL | undefined => (scope ? and(scope, extra) : extra);
    return {
      totalSantri: await countSantri(kamarId),
      menungguMuaddib: await countPerizinan(s(eq(perizinan.status, "menunggu_muaddib"))),
      menungguMudir: await countPerizinan(s(eq(perizinan.status, "menunggu_mudir"))),
      disetujui: await countPerizinan(s(eq(perizinan.status, "disetujui"))),
      berangkat: await countPerizinan(s(eq(perizinan.status, "berangkat"))),
      kembaliHariIni: await countPerizinan(s(and(eq(perizinan.status, "kembali"), kembaliHariIni))),
    };
  },
  async santriStats(userId: number) {
    const own = (extra: SQL) => and(eq(perizinan.userId, userId), extra);
    return {
      totalPerizinan: await countPerizinan(eq(perizinan.userId, userId)),
      menunggu: await countPerizinan(
        own(inArray(perizinan.status, ["menunggu_muaddib", "menunggu_mudir"])),
      ),
      disetujui: await countPerizinan(own(eq(perizinan.status, "disetujui"))),
      berangkat: await countPerizinan(own(eq(perizinan.status, "berangkat"))),
      ditolak: await countPerizinan(
        own(inArray(perizinan.status, ["ditolak_muaddib", "ditolak_mudir"])),
      ),
    };
  },
};
