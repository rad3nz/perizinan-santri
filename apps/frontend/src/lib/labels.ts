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
