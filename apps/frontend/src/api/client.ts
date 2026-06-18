import { treaty } from "@elysiajs/eden";
import type { App } from "@perizinan/backend";
import { getToken } from "../auth/auth-store";

export const api = treaty<App>(import.meta.env.VITE_API_URL, {
  headers() {
    const token = getToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  },
});
