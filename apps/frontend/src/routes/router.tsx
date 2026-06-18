import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AppLayout } from "../layout/AppLayout";
import { roleHome } from "../lib/role-home";
import { AksesDitolak } from "../pages/AksesDitolak";
import { LoginPage } from "../pages/LoginPage";
import { Placeholder } from "../pages/Placeholder";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome(user.role) : "/login"} replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <RootRedirect /> },
          { path: "/profil", element: <Placeholder title="Profil" /> },
          {
            element: <RoleRoute allow={["santri"]} />,
            children: [
              { path: "/santri/dashboard", element: <Placeholder title="Dashboard Santri" /> },
            ],
          },
          {
            element: <RoleRoute allow={["muaddib"]} />,
            children: [
              { path: "/muaddib/dashboard", element: <Placeholder title="Dashboard Muaddib" /> },
            ],
          },
          {
            element: <RoleRoute allow={["mudir"]} />,
            children: [
              { path: "/mudir/dashboard", element: <Placeholder title="Dashboard Mudir" /> },
            ],
          },
          {
            element: <RoleRoute allow={["admin"]} />,
            children: [
              { path: "/admin/dashboard", element: <Placeholder title="Dashboard Admin" /> },
            ],
          },
          { path: "*", element: <AksesDitolak /> },
        ],
      },
    ],
  },
]);
