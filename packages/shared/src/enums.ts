export const ROLES = ["santri", "muaddib", "mudir", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const JENIS_IZIN = ["pulang", "keluar_kota", "kegiatan_sekolah", "lainnya"] as const;
export type JenisIzin = (typeof JENIS_IZIN)[number];

export const PERIZINAN_STATUS = [
  "menunggu_muaddib",
  "ditolak_muaddib",
  "menunggu_mudir",
  "ditolak_mudir",
  "disetujui",
  "berangkat",
  "kembali",
] as const;
export type PerizinanStatus = (typeof PERIZINAN_STATUS)[number];
