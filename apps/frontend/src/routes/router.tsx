import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { PerizinanListView } from "../components/PerizinanListView";
import { AppLayout } from "../layout/AppLayout";
import { roleHome } from "../lib/role-home";
import { AksesDitolak } from "../pages/AksesDitolak";
import { ManajemenKamar } from "../pages/admin/ManajemenKamar";
import { ManajemenPengguna } from "../pages/admin/ManajemenPengguna";
import { LoginPage } from "../pages/LoginPage";
import { PerizinanDetailPage } from "../pages/PerizinanDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { StaffDashboard } from "../pages/StaffDashboard";
import { BuatPerizinan } from "../pages/santri/BuatPerizinan";
import { SantriDashboard } from "../pages/santri/Dashboard";
import { RiwayatPerizinan } from "../pages/santri/Riwayat";
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
          { path: "/profil", element: <ProfilePage /> },
          {
            element: <RoleRoute allow={["santri"]} />,
            children: [
              { path: "/santri/dashboard", element: <SantriDashboard /> },
              { path: "/santri/perizinan/baru", element: <BuatPerizinan /> },
              { path: "/santri/perizinan", element: <RiwayatPerizinan /> },
              { path: "/santri/perizinan/:id", element: <PerizinanDetailPage /> },
            ],
          },
          {
            element: <RoleRoute allow={["muaddib"]} />,
            children: [
              { path: "/muaddib/dashboard", element: <StaffDashboard title="Dashboard Muaddib" /> },
              {
                path: "/muaddib/perizinan",
                element: (
                  <PerizinanListView
                    title="Daftar Perizinan"
                    basePath="/muaddib/perizinan"
                    showActions
                  />
                ),
              },
              { path: "/muaddib/perizinan/:id", element: <PerizinanDetailPage /> },
            ],
          },
          {
            element: <RoleRoute allow={["mudir"]} />,
            children: [
              { path: "/mudir/dashboard", element: <StaffDashboard title="Dashboard Mudir" /> },
              {
                path: "/mudir/perizinan",
                element: (
                  <PerizinanListView
                    title="Daftar Perizinan"
                    basePath="/mudir/perizinan"
                    showActions
                    showKamar
                  />
                ),
              },
              { path: "/mudir/perizinan/:id", element: <PerizinanDetailPage /> },
            ],
          },
          {
            element: <RoleRoute allow={["admin"]} />,
            children: [
              { path: "/admin/dashboard", element: <StaffDashboard title="Dashboard Admin" /> },
              { path: "/admin/kamar", element: <ManajemenKamar /> },
              { path: "/admin/pengguna", element: <ManajemenPengguna /> },
              {
                path: "/admin/perizinan",
                element: (
                  <PerizinanListView
                    title="Semua Perizinan"
                    basePath="/admin/perizinan"
                    showKamarFilter
                    showJenisFilter
                    showKamar
                    showActions
                  />
                ),
              },
              { path: "/admin/perizinan/:id", element: <PerizinanDetailPage /> },
            ],
          },
          { path: "*", element: <AksesDitolak /> },
        ],
      },
    ],
  },
]);
