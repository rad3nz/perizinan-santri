import { Elysia, t } from "elysia";
import { envelope } from "../../lib/envelope";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { pageParams } from "../../lib/pagination";
import { authMacro } from "../../middleware/auth";
import { toNotificationDTO } from "./dto";
import { notifRepo } from "./repository";

export const notificationRoutes = new Elysia({ prefix: "/api/notifications" })
  .use(authMacro)
  .get(
    "/",
    async ({ user, query }) => {
      const { page, limit } = pageParams(query);
      const { items, total } = await notifRepo.list(user.id, {
        page,
        limit,
        unreadOnly: query.unreadOnly,
      });
      const unreadCount = await notifRepo.countUnread(user.id);
      return envelope.ok({ items: items.map(toNotificationDTO), total, page, limit, unreadCount });
    },
    {
      auth: [],
      query: t.Object({
        page: t.Optional(t.Numeric()),
        limit: t.Optional(t.Numeric()),
        unreadOnly: t.Optional(t.Boolean()),
      }),
    },
  )
  .patch(
    "/read-all",
    async ({ user }) => {
      const updated = await notifRepo.markAllRead(user.id);
      return envelope.ok({ updated }, "Semua notifikasi ditandai telah dibaca.");
    },
    { auth: [] },
  )
  .patch(
    "/:id/read",
    async ({ user, params }) => {
      const n = await notifRepo.findById(params.id);
      if (!n) throw new NotFoundError();
      if (n.recipientId !== user.id) {
        throw new ForbiddenError("Anda tidak memiliki akses ke notifikasi ini.");
      }
      await notifRepo.markRead(params.id);
      const updated = await notifRepo.findById(params.id);
      if (!updated) throw new NotFoundError();
      return envelope.ok(toNotificationDTO(updated));
    },
    { auth: [], params: t.Object({ id: t.Numeric() }) },
  );
