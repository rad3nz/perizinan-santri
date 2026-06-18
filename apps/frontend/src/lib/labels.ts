import type { PerizinanStatus } from "@perizinan/shared";

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
