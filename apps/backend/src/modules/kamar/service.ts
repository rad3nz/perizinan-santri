import { ConflictError, NotFoundError } from "../../lib/errors";
import { toKamarDTO } from "./dto";
import { kamarRepo } from "./repository";

export async function listKamar(params: { page: number; limit: number; search?: string }) {
  const { items, total } = await kamarRepo.list(params);
  return {
    items: items.map((r) => toKamarDTO(r, Number(r.jumlahPenghuni))),
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function getKamar(id: number) {
  const row = await kamarRepo.findById(id);
  if (!row) throw new NotFoundError();
  return toKamarDTO(row, await kamarRepo.countSantri(id));
}

export async function createKamar(input: { nama: string; kapasitas: number }) {
  const [{ id }] = await kamarRepo.create(input);
  return getKamar(id);
}

export async function updateKamar(id: number, input: { nama: string; kapasitas: number }) {
  if (!(await kamarRepo.findById(id))) throw new NotFoundError();
  await kamarRepo.update(id, input);
  return getKamar(id);
}

export async function deleteKamar(id: number) {
  if (!(await kamarRepo.findById(id))) throw new NotFoundError();
  if ((await kamarRepo.countUsers(id)) > 0) {
    throw new ConflictError("Kamar masih memiliki penghuni dan tidak dapat dihapus.");
  }
  await kamarRepo.delete(id);
}
