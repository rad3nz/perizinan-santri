import { jwt } from "@elysiajs/jwt";
import type { Role } from "@perizinan/shared";
import { Elysia } from "elysia";
import { env } from "../lib/env";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";
import { usersRepo } from "../modules/users/repository";

export const authMacro = new Elysia({ name: "auth" })
  .use(jwt({ name: "jwt", secret: env.JWT_SECRET, exp: env.JWT_EXPIRES_IN }))
  .macro({
    // usage: .get('/path', handler, { auth: [] })                  -> any authenticated role
    //        .get('/path', handler, { auth: ['admin', 'mudir'] })  -> restricted
    auth(roles: Role[]) {
      return {
        async resolve({ jwt, headers }) {
          const token = headers.authorization?.replace("Bearer ", "");
          const payload = token ? await jwt.verify(token) : false;
          if (!payload) throw new UnauthorizedError("Token tidak valid atau sudah kedaluwarsa.");

          const user = await usersRepo.findById(Number(payload.sub));
          if (!user) throw new UnauthorizedError("Pengguna tidak ditemukan.");

          if (roles.length > 0 && !roles.includes(user.role)) {
            throw new ForbiddenError("Anda tidak memiliki akses ke sumber daya ini.");
          }
          return { user };
        },
      };
    },
  });
