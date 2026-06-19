import { create } from "zustand";

// Mirrors the backend `NotificationDTO` (notifications/dto.ts). Defined locally
// because the WS protocol flows over `.ws()` and is not part of the Eden treaty.
export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  perizinanId: number | null;
  createdAt: string;
}

// Mirrors the backend `ServerEvent` union (notifications/service.ts).
export type ServerEvent =
  | { type: "connected"; unreadCount: number }
  | { type: "notification"; notification: NotificationItem; unreadCount: number }
  | { type: "perizinan_changed" }
  | { type: "pong" };

interface NotifState {
  items: NotificationItem[];
  unreadCount: number;
  onEvent: (evt: ServerEvent) => void;
  setUnread: (count: number) => void;
  reset: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  items: [],
  unreadCount: 0,
  onEvent: (evt) => {
    switch (evt.type) {
      case "connected":
        set({ unreadCount: evt.unreadCount });
        break;
      case "notification":
        set((s) => ({
          items: [evt.notification, ...s.items],
          unreadCount: evt.unreadCount,
        }));
        break;
      default:
        break;
    }
  },
  setUnread: (count) => set({ unreadCount: count }),
  reset: () => set({ items: [], unreadCount: 0 }),
}));
