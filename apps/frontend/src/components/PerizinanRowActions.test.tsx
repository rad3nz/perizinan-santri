import { MantineProvider } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Perizinan } from "../api/types";
import { type AuthUser, useAuthStore } from "../auth/auth-store";
import { PerizinanRowActions } from "./PerizinanRowActions";

const muaddib: AuthUser = {
  id: 9,
  name: "Muaddib",
  username: "muaddib1",
  role: "muaddib",
  kamarId: 1,
  kamar: { id: 1, nama: "K1" },
  nis: null,
  kelas: null,
  waliTelepon: null,
};

function makePerizinan(status: PerizinanStatus): Perizinan {
  return {
    id: 1,
    status,
    jenisIzin: "pulang",
    tujuan: "Rumah",
    tanggalKeluar: "2026-06-18",
    tanggalKembaliRencana: "2026-06-20",
    tanggalKembaliAktual: null,
    catatan: null,
    santri: { id: 1, name: "Santri", nis: "001", kamar: { id: 1, nama: "K1" } },
    muaddib: null,
    muaddibAt: null,
    muaddibCatatan: null,
    mudir: null,
    mudirAt: null,
    mudirCatatan: null,
    alasanPenolakan: null,
    createdAt: "2026-06-18T00:00:00.000Z",
    updatedAt: "2026-06-18T00:00:00.000Z",
  };
}

const renderRow = (status: PerizinanStatus) =>
  render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient()}>
        <PerizinanRowActions perizinan={makePerizinan(status)} />
      </QueryClientProvider>
    </MantineProvider>,
  );

beforeEach(() => useAuthStore.setState({ token: "tok", user: muaddib }));
afterEach(cleanup);

describe("PerizinanRowActions (muaddib)", () => {
  it("shows actions on menunggu_muaddib", () => {
    renderRow("menunggu_muaddib");
    expect(screen.getByRole("button", { name: "Setujui" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tolak" })).toBeInTheDocument();
  });
  it("renders no actions when not actionable for this role", () => {
    renderRow("menunggu_mudir");
    expect(screen.queryByRole("button", { name: "Setujui" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tolak" })).not.toBeInTheDocument();
  });
});
