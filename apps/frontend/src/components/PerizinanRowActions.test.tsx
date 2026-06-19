import { MantineProvider } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("shows an Aksi dropdown revealing Setujui/Tolak on menunggu_muaddib", async () => {
    renderRow("menunggu_muaddib");
    const trigger = screen.getByRole("button", { name: /Aksi/ });
    expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(await screen.findByText("Setujui")).toBeInTheDocument();
    expect(screen.getByText("Tolak")).toBeInTheDocument();
  });
  it("renders no actions when not actionable for this role", () => {
    renderRow("menunggu_mudir");
    expect(screen.queryByRole("button", { name: /Aksi/ })).not.toBeInTheDocument();
  });
});
