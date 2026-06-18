import { ROLES } from "@perizinan/shared";
import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { pageParams } from "../../lib/pagination";
import { authMacro } from "../../middleware/auth";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "./service";

const roleSchema = t.Union(ROLES.map((r) => t.Literal(r)));
const baseFields = {
  name: t.String({ minLength: 1 }),
  username: t.String({ minLength: 3 }),
  role: roleSchema,
  kamarId: t.Optional(t.Nullable(t.Integer())),
  nis: t.Optional(t.Nullable(t.String())),
  kelas: t.Optional(t.Nullable(t.String())),
  waliTelepon: t.Optional(t.Nullable(t.String())),
};
const createBody = t.Object({ ...baseFields, password: t.String({ minLength: 6 }) });
const updateBody = t.Object({ ...baseFields, password: t.Optional(t.String({ minLength: 6 })) });
const idParam = t.Object({ id: t.Numeric() });

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .use(authMacro)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit } = pageParams(query);
      return envelope.ok(
        await listUsers({
          page,
          limit,
          search: query.search,
          role: query.role,
          kamarId: query.kamarId,
        }),
      );
    },
    {
      auth: ["admin"],
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        search: t.Optional(t.String()),
        role: t.Optional(roleSchema),
        kamarId: t.Optional(t.Numeric()),
      }),
    },
  )
  .get("/:id", async ({ params }) => envelope.ok(await getUser(params.id)), {
    auth: ["admin"],
    params: idParam,
  })
  .post(
    "/",
    async ({ body, set }) => {
      set.status = 201;
      return envelope.ok(await createUser(body), "Pengguna berhasil dibuat.");
    },
    { auth: ["admin"], body: createBody },
  )
  .put(
    "/:id",
    async ({ params, body }) =>
      envelope.ok(await updateUser(params.id, body), "Pengguna berhasil diperbarui."),
    { auth: ["admin"], params: idParam, body: updateBody },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await deleteUser(params.id);
      return envelope.ok(null, "Pengguna berhasil dihapus.");
    },
    { auth: ["admin"], params: idParam },
  );
