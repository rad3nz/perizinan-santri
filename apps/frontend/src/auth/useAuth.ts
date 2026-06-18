import type { Role } from "@perizinan/shared";
import { useAuthStore } from "./auth-store";

export function useAuth(): {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
} {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  return { user, token, isAuthenticated: Boolean(token), role: user?.role ?? null };
}
