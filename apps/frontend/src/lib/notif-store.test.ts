import { beforeEach, describe, expect, it } from "vitest";
import type { NotificationItem } from "./notif-store";
import { useNotifStore } from "./notif-store";

const item = (id: number): NotificationItem => ({
  id,
  type: "perizinan_baru",
  message: `Notifikasi ${id}`,
  isRead: false,
  perizinanId: id,
  createdAt: "2026-06-18T00:00:00.000Z",
});

beforeEach(() => {
  useNotifStore.getState().reset();
});

describe("notif-store", () => {
  it("sets unreadCount from a 'connected' event without adding items", () => {
    useNotifStore.getState().onEvent({ type: "connected", unreadCount: 5 });
    const s = useNotifStore.getState();
    expect(s.unreadCount).toBe(5);
    expect(s.items).toHaveLength(0);
  });

  it("prepends the item and sets unreadCount on a 'notification' event", () => {
    useNotifStore
      .getState()
      .onEvent({ type: "notification", notification: item(1), unreadCount: 1 });
    const s = useNotifStore.getState();
    expect(s.items).toHaveLength(1);
    expect(s.items[0]?.id).toBe(1);
    expect(s.unreadCount).toBe(1);
  });

  it("prepends newest-first across multiple notifications", () => {
    const store = useNotifStore.getState();
    store.onEvent({ type: "notification", notification: item(1), unreadCount: 1 });
    store.onEvent({ type: "notification", notification: item(2), unreadCount: 2 });
    const s = useNotifStore.getState();
    expect(s.items.map((n) => n.id)).toEqual([2, 1]);
    expect(s.unreadCount).toBe(2);
  });

  it("ignores 'pong' events", () => {
    useNotifStore.getState().onEvent({ type: "connected", unreadCount: 3 });
    useNotifStore.getState().onEvent({ type: "pong" });
    const s = useNotifStore.getState();
    expect(s.unreadCount).toBe(3);
    expect(s.items).toHaveLength(0);
  });

  it("reset() clears items and zeroes unreadCount", () => {
    const store = useNotifStore.getState();
    store.onEvent({ type: "notification", notification: item(1), unreadCount: 9 });
    store.reset();
    const s = useNotifStore.getState();
    expect(s.items).toHaveLength(0);
    expect(s.unreadCount).toBe(0);
  });
});
