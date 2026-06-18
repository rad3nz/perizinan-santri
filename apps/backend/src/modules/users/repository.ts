import type { Role } from "@perizinan/shared";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";

export const usersRepo = {
  findById: (id: number) =>
    db.query.users.findFirst({ where: eq(users.id, id), with: { kamar: true } }),
  findByUsername: (username: string) =>
    db.query.users.findFirst({ where: eq(users.username, username), with: { kamar: true } }),
  findByRole: (role: Role) => db.query.users.findMany({ where: eq(users.role, role) }),
};

export type UserRow = NonNullable<Awaited<ReturnType<typeof usersRepo.findById>>>;
