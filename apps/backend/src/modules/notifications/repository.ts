import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { notifications } from "../../db/schema";

export type NotifRow = typeof notifications.$inferSelect;
export type NewNotification = {
  recipientId: number;
  type: string;
  message: string;
  perizinanId: number | null;
};

export const notifRepo = {
  async insertMany(rows: NewNotification[]): Promise<NotifRow[]> {
    const saved: NotifRow[] = [];
    for (const r of rows) {
      const [{ id }] = await db.insert(notifications).values(r).$returningId();
      const row = await db.query.notifications.findFirst({ where: eq(notifications.id, id) });
      if (row) saved.push(row);
    }
    return saved;
  },
  async list(recipientId: number, opts: { page: number; limit: number; unreadOnly?: boolean }) {
    const conds = [eq(notifications.recipientId, recipientId)];
    if (opts.unreadOnly) conds.push(eq(notifications.isRead, false));
    const where = and(...conds);
    const items = await db.query.notifications.findMany({
      where,
      orderBy: desc(notifications.createdAt),
      limit: opts.limit,
      offset: (opts.page - 1) * opts.limit,
    });
    const all = await db.query.notifications.findMany({ where, columns: { id: true } });
    return { items, total: all.length };
  },
  async countUnread(recipientId: number) {
    const rows = await db.query.notifications.findMany({
      where: and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, false)),
      columns: { id: true },
    });
    return rows.length;
  },
  findById: (id: number) => db.query.notifications.findFirst({ where: eq(notifications.id, id) }),
  markRead: (id: number) =>
    db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)),
  async markAllRead(recipientId: number) {
    const res = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.recipientId, recipientId), eq(notifications.isRead, false)));
    return res[0].affectedRows;
  },
};
