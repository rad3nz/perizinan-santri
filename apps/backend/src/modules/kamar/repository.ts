import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { kamar, users } from "../../db/schema";

export const kamarRepo = {
  async list({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const where = search ? like(kamar.nama, `%${search}%`) : undefined;
    const rows = await db
      .select({
        id: kamar.id,
        nama: kamar.nama,
        kapasitas: kamar.kapasitas,
        createdAt: kamar.createdAt,
        updatedAt: kamar.updatedAt,
        jumlahPenghuni: sql<number>`(select count(*) from ${users} where ${users.kamarId} = ${kamar.id} and ${users.role} = 'santri')`,
      })
      .from(kamar)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit);
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(kamar).where(where);
    return { items: rows, total: Number(total) };
  },
  findById: (id: number) => db.query.kamar.findFirst({ where: eq(kamar.id, id) }),
  create: (v: { nama: string; kapasitas: number }) => db.insert(kamar).values(v).$returningId(),
  update: (id: number, v: { nama: string; kapasitas: number }) =>
    db.update(kamar).set(v).where(eq(kamar.id, id)),
  delete: (id: number) => db.delete(kamar).where(eq(kamar.id, id)),
  async countSantri(id: number) {
    const [{ c }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(users)
      .where(and(eq(users.kamarId, id), eq(users.role, "santri")));
    return Number(c);
  },
  async countUsers(id: number) {
    const [{ c }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.kamarId, id));
    return Number(c);
  },
};
