import { MantineProvider } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { TRANSITIONS } from "@perizinan/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Perizinan } from "../api/types";
import { type AuthUser, useAuthStore } from "../auth/auth-store";
import { PerizinanActions } from "./PerizinanActions";

const santri: AuthUser = {
  id: 1,
  name: "Santri Satu",
  username: "santri1",
  role: "santri",
  kamarId: 1,
  kamar: { id: 1, nama: "K1" },
  nis: "001",
  kelas: "X",
  waliTelepon: "08",
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
    santri: { id: 1, name: "Santri Satu", nis: "001", kamar: { id: 1, nama: "K1" } },
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

function renderActions(status: PerizinanStatus) {
  return render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <PerizinanActions perizinan={makePerizinan(status)} />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ token: "tok", user: santri });
});
afterEach(cleanup);

describe("PerizinanActions (santri)", () => {
  it("enables Berangkat only at its transition from-status", () => {
    renderActions(TRANSITIONS.berangkat.from); // "disetujui"
    expect(screen.getByRole("button", { name: "Berangkat" })).toBeEnabled();
  });

  it("disables Berangkat when status is not the from-status", () => {
    renderActions("menunggu_mudir");
    expect(screen.getByRole("button", { name: "Berangkat" })).toBeDisabled();
  });

  it("enables Kembali only at its transition from-status", () => {
    renderActions(TRANSITIONS.kembali.from); // "berangkat"
    expect(screen.getByRole("button", { name: "Kembali" })).toBeEnabled();
  });

  it("disables Kembali when status is not the from-status", () => {
    renderActions("disetujui");
    expect(screen.getByRole("button", { name: "Kembali" })).toBeDisabled();
  });
});
