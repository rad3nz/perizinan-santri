import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "../../lib/env";
import { wsRegistry } from "../../lib/ws-registry";
import { notifRepo } from "./repository";

const socketUser = new WeakMap<object, number>();

export const wsRoutes = new Elysia()
  .use(jwt({ name: "jwt", secret: env.JWT_SECRET, exp: env.JWT_EXPIRES_IN }))
  .ws("/ws", {
    async open(ws) {
      const token = new URL(ws.data.request.url).searchParams.get("token");
      const payload = token ? await ws.data.jwt.verify(token) : false;
      if (!payload) {
        ws.close(1008, "Unauthorized");
        return;
      }
      const userId = Number(payload.sub);
      socketUser.set(ws, userId);
      wsRegistry.add(userId, ws);
      ws.send(
        JSON.stringify({ type: "connected", unreadCount: await notifRepo.countUnread(userId) }),
      );
    },
    message(ws, message) {
      if (message && typeof message === "object" && "type" in message && message.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    },
    close(ws) {
      const userId = socketUser.get(ws);
      if (userId != null) {
        wsRegistry.remove(userId, ws);
        socketUser.delete(ws);
      }
    },
  });
