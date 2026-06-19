import type { JenisIzin, PerizinanStatus } from "@perizinan/shared";

const LABELS: Record<PerizinanStatus, string> = {
  menunggu_muaddib: "Menunggu Muaddib",
  menunggu_mudir: "Menunggu Mudir",
  disetujui: "Disetujui",
  berangkat: "Berangkat",
  kembali: "Kembali",
  ditolak_muaddib: "Ditolak Muaddib",
  ditolak_mudir: "Ditolak Mudir",
};

const TONES: Record<PerizinanStatus, string> = {
  menunggu_muaddib: "yellow",
  menunggu_mudir: "yellow",
  disetujui: "green",
  berangkat: "blue",
  kembali: "gray",
  ditolak_muaddib: "red",
  ditolak_mudir: "red",
};

export const statusLabel = (s: PerizinanStatus): string => LABELS[s];
export const statusTone = (s: PerizinanStatus): string => TONES[s];

const JENIS_IZIN_LABELS: Record<JenisIzin, string> = {
  pulang: "Pulang",
  keluar_kota: "Keluar Kota",
  kegiatan_sekolah: "Kegiatan Sekolah",
  lainnya: "Lainnya",
};

export const jenisIzinLabel = (j: JenisIzin): string => JENIS_IZIN_LABELS[j];

export type ApprovalLevel = "approved" | "rejected" | "pending" | "none";
export interface ApprovalState {
  muaddib: ApprovalLevel;
  mudir: ApprovalLevel;
}

export function approvalState(status: PerizinanStatus): ApprovalState {
  const muaddib: ApprovalLevel =
    status === "menunggu_muaddib"
      ? "pending"
      : status === "ditolak_muaddib"
        ? "rejected"
        : "approved";

  let mudir: ApprovalLevel;
  if (status === "menunggu_muaddib" || status === "ditolak_muaddib") mudir = "none";
  else if (status === "menunggu_mudir") mudir = "pending";
  else if (status === "ditolak_mudir") mudir = "rejected";
  else mudir = "approved"; // disetujui | berangkat | kembali

  return { muaddib, mudir };
}
