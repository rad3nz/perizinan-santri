import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { type AuthUser, useAuthStore } from "../auth/auth-store";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

const muaddib: AuthUser = {
  id: 1,
  name: "Ustadz",
  username: "m",
  role: "muaddib",
  kamarId: 1,
  kamar: { id: 1, nama: "K1" },
  nis: null,
  kelas: null,
  waliTelepon: null,
};

function renderAt(path: string, tree: ReactNode) {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Halaman Login</div>} />
          {tree}
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
});

describe("ProtectedRoute", () => {
  it("redirects to /login when there is no token", () => {
    renderAt(
      "/rahasia",
      <Route element={<ProtectedRoute />}>
        <Route path="/rahasia" element={<div>Rahasia</div>} />
      </Route>,
    );
    expect(screen.getByText("Halaman Login")).toBeInTheDocument();
  });
});

describe("RoleRoute", () => {
  it("renders 'Akses ditolak' for a disallowed role", () => {
    useAuthStore.setState({ token: "tok", user: muaddib });
    renderAt(
      "/santri",
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={["santri"]} />}>
          <Route path="/santri" element={<div>Khusus Santri</div>} />
        </Route>
      </Route>,
    );
    expect(screen.getByText(/Akses ditolak/i)).toBeInTheDocument();
  });

  it("renders the child for an allowed role", () => {
    useAuthStore.setState({ token: "tok", user: { ...muaddib, role: "santri" } });
    renderAt(
      "/santri",
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={["santri"]} />}>
          <Route path="/santri" element={<div>Khusus Santri</div>} />
        </Route>
      </Route>,
    );
    expect(screen.getByText("Khusus Santri")).toBeInTheDocument();
  });
});
