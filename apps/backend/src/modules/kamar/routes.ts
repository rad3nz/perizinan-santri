import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { pageParams } from "../../lib/pagination";
import { authMacro } from "../../middleware/auth";
import { createKamar, deleteKamar, getKamar, listKamar, updateKamar } from "./service";

const kamarBody = t.Object({
  nama: t.String({ minLength: 1, maxLength: 100 }),
  kapasitas: t.Integer({ minimum: 0 }),
});
const idParam = t.Object({ id: t.Numeric() });

export const kamarRoutes = new Elysia({ prefix: "/api/kamar" })
  .use(authMacro)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit } = pageParams(query);
      return envelope.ok(await listKamar({ page, limit, search: query.search }));
    },
    {
      auth: ["admin", "mudir"],
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        search: t.Optional(t.String()),
      }),
    },
  )
  .get("/:id", async ({ params }) => envelope.ok(await getKamar(params.id)), {
    auth: ["admin", "mudir"],
    params: idParam,
  })
  .post(
    "/",
    async ({ body, set }) => {
      set.status = 201;
      return envelope.ok(await createKamar(body), "Kamar berhasil dibuat.");
    },
    { auth: ["admin"], body: kamarBody },
  )
  .put(
    "/:id",
    async ({ params, body }) =>
      envelope.ok(await updateKamar(params.id, body), "Kamar berhasil diperbarui."),
    { auth: ["admin"], params: idParam, body: kamarBody },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await deleteKamar(params.id);
      return envelope.ok(null, "Kamar berhasil dihapus.");
    },
    { auth: ["admin"], params: idParam },
  );
