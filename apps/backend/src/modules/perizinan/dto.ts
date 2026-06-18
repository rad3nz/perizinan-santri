import type { perizinanRepo } from "./repository";

type RelationalRow = NonNullable<Awaited<ReturnType<typeof perizinanRepo.findByIdWithRelations>>>;

const dateStr = (v: Date | string): string =>
  typeof v === "string" ? v.slice(0, 10) : v.toISOString().slice(0, 10);
const iso = (v: Date | string | null): string | null =>
  v == null ? null : typeof v === "string" ? v : v.toISOString();

export function toPerizinanDTO(row: RelationalRow) {
  return {
    id: row.id,
    status: row.status,
    jenisIzin: row.jenisIzin,
    tujuan: row.tujuan,
    tanggalKeluar: dateStr(row.tanggalKeluar),
    tanggalKembaliRencana: dateStr(row.tanggalKembaliRencana),
    tanggalKembaliAktual: row.tanggalKembaliAktual ? dateStr(row.tanggalKembaliAktual) : null,
    catatan: row.catatan,
    santri: {
      id: row.santri.id,
      name: row.santri.name,
      nis: row.santri.nis,
      kamar: row.santri.kamar ? { id: row.santri.kamar.id, nama: row.santri.kamar.nama } : null,
    },
    muaddib: row.muaddib ? { id: row.muaddib.id, name: row.muaddib.name } : null,
    muaddibAt: iso(row.muaddibAt),
    muaddibCatatan: row.muaddibCatatan,
    mudir: row.mudir ? { id: row.mudir.id, name: row.mudir.name } : null,
    mudirAt: iso(row.mudirAt),
    mudirCatatan: row.mudirCatatan,
    alasanPenolakan: row.alasanPenolakan,
    createdAt: iso(row.createdAt) as string,
    updatedAt: iso(row.updatedAt) as string,
  };
}

export type PerizinanDTO = ReturnType<typeof toPerizinanDTO>;
