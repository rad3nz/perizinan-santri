import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "./lib/env";
import { onErrorHandler } from "./lib/on-error";
import { authRoutes } from "./modules/auth/routes";
import { dashboardRoutes } from "./modules/dashboard/routes";
import { kamarRoutes } from "./modules/kamar/routes";
import { notificationRoutes } from "./modules/notifications/routes";
import { wsRoutes } from "./modules/notifications/ws";
import { perizinanRoutes } from "./modules/perizinan/routes";
import { usersRoutes } from "./modules/users/routes";

export const app = new Elysia()
  .use(cors({ origin: env.CORS_ORIGIN }))
  .onError(onErrorHandler)
  .use(authRoutes)
  .use(kamarRoutes)
  .use(usersRoutes)
  .use(perizinanRoutes)
  .use(notificationRoutes)
  .use(dashboardRoutes)
  .use(wsRoutes);

export type App = typeof app;

if (import.meta.main) {
  app.listen(env.PORT, () => console.log(`Server di http://localhost:${env.PORT}`));
}
