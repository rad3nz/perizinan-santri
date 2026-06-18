import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useAuthStore } from "../auth/auth-store";
import { type ServerEvent, useNotifStore } from "./notif-store";

const PING_INTERVAL = 25_000;
const MAX_BACKOFF = 30_000;

/**
 * Opens the authenticated notification WebSocket after login and feeds the
 * notif-store. Survives transient disconnects with exponential backoff + jitter,
 * pings to stay warm, and force-logs-out on an auth rejection (close code 1008).
 * Mounted once inside the authenticated AppLayout.
 */
export function useNotificationSocket(): void {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    let ws: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let closedByUs = false;

    const connect = () => {
      ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws?token=${token}`);

      ws.onopen = () => {
        attempt = 0;
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        let evt: ServerEvent;
        try {
          evt = JSON.parse(event.data) as ServerEvent;
        } catch {
          return;
        }
        useNotifStore.getState().onEvent(evt);
        if (evt.type === "notification") {
          notifications.show({ message: evt.notification.message, color: "brand" });
        }
      };

      ws.onclose = (event) => {
        if (pingTimer) clearInterval(pingTimer);
        if (closedByUs) return;
        if (event.code === 1008) {
          // Auth rejected — retrying would loop; force logout instead.
          useAuthStore.getState().clear();
          window.location.assign("/login");
          return;
        }
        const backoff = Math.min(1000 * 2 ** attempt, MAX_BACKOFF) + Math.random() * 1000;
        attempt += 1;
        reconnectTimer = setTimeout(connect, backoff);
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      useNotifStore.getState().reset();
    };
  }, [token]);
}
