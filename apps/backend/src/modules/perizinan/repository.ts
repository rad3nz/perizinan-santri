import type { JenisIzin, PerizinanStatus, Role } from "@perizinan/shared";
import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { db } from "../../db/client";
import { kamar, perizinan, users } from "../../db/schema";

// MariaDB has no LATERAL, so Drizzle's `with`-relation queries don't run here;
// load santri (+kamar), muaddib, and mudir via explicit aliased joins + mapping.
const santriT = alias(users, "santri");
const muaddibT = alias(users, "muaddib");
const mudirT = alias(users, "mudir");

const relationalSelect = () =>
  db
    .select({ perizinan, santri: santriT, kamar, muaddib: muaddibT, mudir: mudirT })
    .from(perizinan)
    .innerJoin(santriT, eq(perizinan.userId, santriT.id))
    .leftJoin(kamar, eq(santriT.kamarId, kamar.id))
    .leftJoin(muaddibT, eq(perizinan.muaddibId, muaddibT.id))
    .leftJoin(mudirT, eq(perizinan.mudirId, mudirT.id));

function mapRelational(r: {
  perizinan: typeof perizinan.$inferSelect;
  santri: typeof users.$inferSelect;
  kamar: typeof kamar.$inferSelect | null;
  muaddib: typeof users.$inferSelect | null;
  mudir: typeof users.$inferSelect | null;
}) {
  return {
    ...r.perizinan,
    santri: { ...r.santri, kamar: r.kamar },
    muaddib: r.muaddib,
    mudir: r.mudir,
  };
}

const MUDIR_VISIBLE: PerizinanStatus[] = [
  "menunggu_mudir",
  "disetujui",
  "berangkat",
  "kembali",
  "ditolak_mudir",
];

type Scope = { id: number; role: Role; kamarId: number | null };
type Filters = {
  status?: PerizinanStatus;
  jenisIzin?: JenisIzin;
  kamarId?: number;
  userId?: number;
};

function inKamar(kamarId: number) {
  return inArray(
    perizinan.userId,
    db.select({ id: users.id }).from(users).where(eq(users.kamarId, kamarId)),
  );
}

function buildWhere(actor: Scope, f: Filters): SQL | undefined {
  const conds: SQL[] = [];
  if (actor.role === "santri") conds.push(eq(perizinan.userId, actor.id));
  else if (actor.role === "muaddib" && actor.kamarId != null) conds.push(inKamar(actor.kamarId));
  else if (actor.role === "mudir") conds.push(inArray(perizinan.status, MUDIR_VISIBLE));
  // admin: no scope condition

  if (f.status) conds.push(eq(perizinan.status, f.status));
  if (f.jenisIzin) conds.push(eq(perizinan.jenisIzin, f.jenisIzin));
  if (f.userId != null && actor.role === "admin") conds.push(eq(perizinan.userId, f.userId));
  if (f.kamarId != null && (actor.role === "admin" || actor.role === "mudir"))
    conds.push(inKamar(f.kamarId));

  return conds.length ? and(...conds) : undefined;
}

export const perizinanRepo = {
  async list(actor: Scope, f: Filters & { page: number; limit: number }) {
    const where = buildWhere(actor, f);
    const rows = await relationalSelect()
      .where(where)
      .orderBy(desc(perizinan.createdAt))
      .limit(f.limit)
      .offset((f.page - 1) * f.limit);
    const all = await db.select({ id: perizinan.id }).from(perizinan).where(where);
    return { items: rows.map(mapRelational), total: all.length };
  },
  async findByIdWithRelations(id: number) {
    const [row] = await relationalSelect().where(eq(perizinan.id, id)).limit(1);
    return row ? mapRelational(row) : undefined;
  },
  findById: (id: number) => db.query.perizinan.findFirst({ where: eq(perizinan.id, id) }),
  delete: (id: number) => db.delete(perizinan).where(eq(perizinan.id, id)),
  create: async (values: typeof perizinan.$inferInsert) => {
    const [{ id }] = await db.insert(perizinan).values(values).$returningId();
    const row = await db.query.perizinan.findFirst({ where: eq(perizinan.id, id) });
    return row as NonNullable<typeof row>;
  },
  update: async (id: number, patch: Partial<typeof perizinan.$inferSelect>) => {
    await db.update(perizinan).set(patch).where(eq(perizinan.id, id));
    const row = await db.query.perizinan.findFirst({ where: eq(perizinan.id, id) });
    return row as NonNullable<typeof row>;
  },
};
