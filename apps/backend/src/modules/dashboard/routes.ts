import { Elysia } from "elysia";
import { envelope } from "../../lib/envelope";
import { authMacro } from "../../middleware/auth";
import { getStats } from "./service";

export const dashboardRoutes = new Elysia({ prefix: "/api/dashboard" })
  .use(authMacro)
  .get("/stats", async ({ user }) => envelope.ok(await getStats(user)), { auth: [] });
