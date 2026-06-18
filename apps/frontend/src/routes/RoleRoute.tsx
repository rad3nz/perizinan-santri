import type { Role } from "@perizinan/shared";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import { AksesDitolak } from "../pages/AksesDitolak";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <AksesDitolak />;
  return <Outlet />;
}
