export const formatTanggal = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export const formatRupiah = (n: number): string => `Rp ${n.toLocaleString("id-ID")}`;
