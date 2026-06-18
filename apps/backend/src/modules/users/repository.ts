import type { Role } from "@perizinan/shared";
import { and, eq, like, ne, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { perizinan, users } from "../../db/schema";

type UserValues = {
  name: string;
  username: string;
  password: string;
  role: Role;
  kamarId: number | null;
  nis: string | null;
  kelas: string | null;
  waliTelepon: string | null;
};

export const usersRepo = {
  findById: (id: number) =>
    db.query.users.findFirst({ where: eq(users.id, id), with: { kamar: true } }),
  findByUsername: (username: string) =>
    db.query.users.findFirst({ where: eq(users.username, username), with: { kamar: true } }),
  findByRole: (role: Role) => db.query.users.findMany({ where: eq(users.role, role) }),

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    kamarId?: number;
  }) {
    const conds = [];
    if (params.search) {
      conds.push(
        or(
          like(users.name, `%${params.search}%`),
          like(users.username, `%${params.search}%`),
          like(users.nis, `%${params.search}%`),
        ),
      );
    }
    if (params.role) conds.push(eq(users.role, params.role));
    if (params.kamarId != null) conds.push(eq(users.kamarId, params.kamarId));
    const where = conds.length ? and(...conds) : undefined;
    const items = await db.query.users.findMany({
      where,
      with: { kamar: true },
      limit: params.limit,
      offset: (params.page - 1) * params.limit,
    });
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(users).where(where);
    return { items, total: Number(total) };
  },
  create: (v: UserValues) => db.insert(users).values(v).$returningId(),
  update: (id: number, v: Partial<UserValues>) => db.update(users).set(v).where(eq(users.id, id)),
  delete: (id: number) => db.delete(users).where(eq(users.id, id)),

  async existsMuaddibForKamar(kamarId: number, exceptId?: number) {
    const conds = [eq(users.kamarId, kamarId), eq(users.role, "muaddib")];
    if (exceptId != null) conds.push(ne(users.id, exceptId));
    return !!(await db.query.users.findFirst({ where: and(...conds) }));
  },
  async usernameTaken(username: string, exceptId?: number) {
    const conds = [eq(users.username, username)];
    if (exceptId != null) conds.push(ne(users.id, exceptId));
    return !!(await db.query.users.findFirst({ where: and(...conds) }));
  },
  async ownsPerizinan(id: number) {
    const [{ c }] = await db
      .select({ c: sql<number>`count(*)` })
      .from(perizinan)
      .where(eq(perizinan.userId, id));
    return Number(c) > 0;
  },
};

export type UserRow = NonNullable<Awaited<ReturnType<typeof usersRepo.findById>>>;
