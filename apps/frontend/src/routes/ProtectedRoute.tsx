import { Center, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../auth/auth-store";

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const [loading, setLoading] = useState(Boolean(token) && !user);

  useEffect(() => {
    let active = true;
    if (token && !user) {
      api.api.auth.me.get().then(({ data, error }) => {
        if (!active) return;
        if (error || !data?.data) clear();
        else setSession(token, data.data);
        setLoading(false);
      });
    }
    return () => {
      active = false;
    };
  }, [token, user, setSession, clear]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="brand" />
      </Center>
    );
  }
  return <Outlet />;
}
