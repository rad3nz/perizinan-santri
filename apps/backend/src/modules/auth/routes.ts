import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { authMacro } from "../../middleware/auth";
import { toUserDTO } from "../users/dto";
import { login } from "./service";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(authMacro)
  .post(
    "/login",
    async ({ body, jwt }) => {
      const data = await login(body.username, body.password, (payload) => jwt.sign(payload));
      return envelope.ok(data, "Berhasil masuk.");
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )
  .post("/logout", () => envelope.ok(null, "Berhasil keluar."), { auth: [] })
  .get("/me", ({ user }) => envelope.ok(toUserDTO(user)), { auth: [] });
