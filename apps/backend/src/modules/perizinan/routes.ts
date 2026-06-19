import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { NotFoundError } from "../../lib/errors";
import { pageParams } from "../../lib/pagination";
import { jenisIzinSchema, statusSchema } from "../../lib/schema";
import { wsRegistry } from "../../lib/ws-registry";
import { authMacro } from "../../middleware/auth";
import { notifRepo } from "../notifications/repository";
import { createNotificationService } from "../notifications/service";
import { usersRepo } from "../users/repository";
import { toPerizinanDTO } from "./dto";
import { assertCanView } from "./guards";
import { perizinanRepo } from "./repository";
import { PerizinanService } from "./service";

const notify = createNotificationService({ notifRepo, usersRepo, ws: wsRegistry });
const service = new PerizinanService(perizinanRepo, usersRepo, notify);

const writeBody = t.Object({
  jenisIzin: jenisIzinSchema,
  tujuan: t.String({ minLength: 1, maxLength: 255 }),
  tanggalKeluar: t.String({ format: "date" }),
  tanggalKembaliRencana: t.String({ format: "date" }),
  catatan: t.Optional(t.Nullable(t.String())),
});
const idParam = t.Object({ id: t.Numeric() });

async function dtoById(id: number) {
  const row = await perizinanRepo.findByIdWithRelations(id);
  if (!row) throw new NotFoundError();
  return toPerizinanDTO(row);
}

export const perizinanRoutes = new Elysia({ prefix: "/api/perizinan" })
  .use(authMacro)
  // Any successful mutation tells every connected client to refetch their tables
  // and dashboards in real time (covers admin, who receives no notifications).
  .onAfterHandle(({ request }) => {
    if (request.method !== "GET") wsRegistry.broadcast({ type: "perizinan_changed" });
  })
  .get(
    "/",
    async ({ user, query }) => {
      const { page, limit } = pageParams(query);
      const { items, total } = await perizinanRepo.list(user, {
        page,
        limit,
        status: query.status,
        jenisIzin: query.jenisIzin,
        kamarId: query.kamarId,
        userId: query.userId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
      });
      return envelope.ok({ items: items.map(toPerizinanDTO), total, page, limit });
    },
    {
      auth: [],
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        status: t.Optional(statusSchema),
        jenisIzin: t.Optional(jenisIzinSchema),
        kamarId: t.Optional(t.Numeric()),
        userId: t.Optional(t.Numeric()),
        dateFrom: t.Optional(t.String({ format: "date" })),
        dateTo: t.Optional(t.String({ format: "date" })),
      }),
    },
  )
  .post(
    "/",
    async ({ user, body, set }) => {
      const created = await service.submit(user, body);
      set.status = 201;
      return envelope.ok(await dtoById(created.id), "Perizinan berhasil diajukan.");
    },
    { auth: ["santri"], body: writeBody },
  )
  .get(
    "/:id",
    async ({ user, params }) => {
      const row = await perizinanRepo.findByIdWithRelations(params.id);
      if (!row) throw new NotFoundError();
      assertCanView(user, row, row.santri.kamar?.id ?? null);
      return envelope.ok(toPerizinanDTO(row));
    },
    { auth: [], params: idParam },
  )
  .put(
    "/:id",
    async ({ user, params, body }) => {
      await service.edit(params.id, user, body);
      return envelope.ok(await dtoById(params.id), "Perizinan berhasil diperbarui.");
    },
    { auth: ["santri"], params: idParam, body: writeBody },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      if (!(await perizinanRepo.findById(params.id))) throw new NotFoundError();
      await perizinanRepo.delete(params.id);
      return envelope.ok(null, "Perizinan berhasil dihapus.");
    },
    { auth: ["admin"], params: idParam },
  )
  .patch(
    "/:id/approve-muaddib",
    async ({ user, params, body }) => {
      await service.approveMuaddib(params.id, user, body.catatan);
      return envelope.ok(await dtoById(params.id), "Perizinan disetujui dan diteruskan ke Mudir.");
    },
    { auth: ["muaddib"], params: idParam, body: t.Object({ catatan: t.Optional(t.String()) }) },
  )
  .patch(
    "/:id/reject-muaddib",
    async ({ user, params, body }) => {
      await service.rejectMuaddib(params.id, user, body.alasanPenolakan);
      return envelope.ok(await dtoById(params.id), "Perizinan ditolak.");
    },
    {
      auth: ["muaddib"],
      params: idParam,
      body: t.Object({ alasanPenolakan: t.String({ minLength: 1 }) }),
    },
  )
  .patch(
    "/:id/approve-mudir",
    async ({ user, params, body }) => {
      await service.approveMudir(params.id, user, body.catatan);
      return envelope.ok(await dtoById(params.id), "Perizinan disetujui.");
    },
    { auth: ["mudir"], params: idParam, body: t.Object({ catatan: t.Optional(t.String()) }) },
  )
  .patch(
    "/:id/reject-mudir",
    async ({ user, params, body }) => {
      await service.rejectMudir(params.id, user, body.alasanPenolakan);
      return envelope.ok(await dtoById(params.id), "Perizinan ditolak.");
    },
    {
      auth: ["mudir"],
      params: idParam,
      body: t.Object({ alasanPenolakan: t.String({ minLength: 1 }) }),
    },
  )
  .patch(
    "/:id/berangkat",
    async ({ user, params }) => {
      await service.berangkat(params.id, user);
      return envelope.ok(await dtoById(params.id), "Status diperbarui menjadi Berangkat.");
    },
    { auth: ["santri"], params: idParam },
  )
  .patch(
    "/:id/kembali",
    async ({ user, params }) => {
      await service.kembali(params.id, user);
      return envelope.ok(await dtoById(params.id), "Status diperbarui menjadi Kembali.");
    },
    { auth: ["santri"], params: idParam },
  );
