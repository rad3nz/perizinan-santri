import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { authMacro } from "../../middleware/auth";
import { getStats } from "./service";

export const dashboardRoutes = new Elysia({ prefix: "/api/dashboard" })
  .use(authMacro)
  .get(
    "/stats",
    async ({ user, query }) =>
      envelope.ok(await getStats(user, { dateFrom: query.dateFrom, dateTo: query.dateTo })),
    {
      auth: [],
      query: t.Object({
        dateFrom: t.Optional(t.String({ format: "date" })),
        dateTo: t.Optional(t.String({ format: "date" })),
      }),
    },
  );
