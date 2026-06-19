import { MantineProvider } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
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
const mudir: AuthUser = { ...muaddib, id: 8, role: "mudir", kamarId: null, kamar: null };
const admin: AuthUser = { ...muaddib, id: 7, role: "admin", kamarId: null, kamar: null };
const santri: AuthUser = {
  id: 1,
  name: "Santri",
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

const renderRow = (user: AuthUser, status: PerizinanStatus) => {
  useAuthStore.setState({ token: "tok", user });
  return render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient()}>
        <PerizinanRowActions perizinan={makePerizinan(status)} />
      </QueryClientProvider>
    </MantineProvider>,
  );
};

afterEach(cleanup);

describe("PerizinanRowActions", () => {
  it("muaddib on menunggu_muaddib shows Setujui/Tolak (act mode)", async () => {
    renderRow(muaddib, "menunggu_muaddib");
    await userEvent.click(screen.getByRole("button", { name: /Aksi/ }));
    expect(await screen.findByText("Setujui")).toBeInTheDocument();
    expect(screen.getByText("Tolak")).toBeInTheDocument();
  });

  it("muaddib can still edit decision while menunggu_mudir (edit mode)", async () => {
    renderRow(muaddib, "menunggu_mudir");
    await userEvent.click(screen.getByRole("button", { name: /Aksi/ }));
    expect(await screen.findByText("Setujui")).toBeInTheDocument();
    expect(screen.getByText("Tolak")).toBeInTheDocument();
  });

  it("muaddib has no actions once mudir acted (disetujui)", () => {
    renderRow(muaddib, "disetujui");
    expect(screen.queryByRole("button", { name: /Aksi/ })).not.toBeInTheDocument();
  });

  it("mudir can edit decision while disetujui (edit mode)", async () => {
    renderRow(mudir, "disetujui");
    await userEvent.click(screen.getByRole("button", { name: /Aksi/ }));
    expect(await screen.findByText("Setujui")).toBeInTheDocument();
    expect(screen.getByText("Tolak")).toBeInTheDocument();
  });

  it("mudir has no actions after santri departed (berangkat)", () => {
    renderRow(mudir, "berangkat");
    expect(screen.queryByRole("button", { name: /Aksi/ })).not.toBeInTheDocument();
  });

  it("santri owner sees Edit + Hapus on a pending request", async () => {
    renderRow(santri, "menunggu_muaddib");
    await userEvent.click(screen.getByRole("button", { name: /Aksi/ }));
    expect(await screen.findByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Hapus")).toBeInTheDocument();
  });

  it("santri has no actions once approved (menunggu_mudir)", () => {
    renderRow(santri, "menunggu_mudir");
    expect(screen.queryByRole("button", { name: /Aksi/ })).not.toBeInTheDocument();
  });

  it("admin sees Hapus on any row", async () => {
    renderRow(admin, "disetujui");
    await userEvent.click(screen.getByRole("button", { name: /Aksi/ }));
    expect(await screen.findByText("Hapus")).toBeInTheDocument();
  });
});
