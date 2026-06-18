type KamarRow = { id: number; nama: string; kapasitas: number; createdAt: Date; updatedAt: Date };

export function toKamarDTO(row: KamarRow, jumlahPenghuni: number) {
  return {
    id: row.id,
    nama: row.nama,
    kapasitas: row.kapasitas,
    jumlahPenghuni,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export type KamarDTO = ReturnType<typeof toKamarDTO>;
