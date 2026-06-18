import type { NotifRow } from "./repository";

const iso = (v: Date | string): string => (typeof v === "string" ? v : v.toISOString());

export function toNotificationDTO(n: NotifRow) {
  return {
    id: n.id,
    type: n.type,
    message: n.message,
    isRead: n.isRead,
    perizinanId: n.perizinanId,
    createdAt: iso(n.createdAt),
  };
}

export type NotificationDTO = ReturnType<typeof toNotificationDTO>;
