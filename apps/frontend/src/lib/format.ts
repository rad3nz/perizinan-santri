export const formatTanggal = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export const formatRupiah = (n: number): string => `Rp ${n.toLocaleString("id-ID")}`;

// Whole-day span between two ISO dates (rencana − keluar), never negative.
export const durationHari = (from: string, to: string): number =>
  Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));
