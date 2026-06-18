import type { PerizinanStatus, Role } from "@perizinan/shared";
import { ConflictError, ForbiddenError, ValidationError } from "../../lib/errors";

export type Actor = { id: number; role: Role; kamarId: number | null };
export type GuardP = { userId: number; status: PerizinanStatus };

export function assertTransition(p: GuardP, expected: PerizinanStatus) {
  if (p.status !== expected) {
    throw new ConflictError(`Status saat ini "${p.status}" tidak dapat melakukan aksi ini.`);
  }
}

export function assertSameKamar(actor: Actor, ownerKamarId: number | null) {
  if (actor.kamarId == null || actor.kamarId !== ownerKamarId) {
    throw new ForbiddenError("Anda hanya dapat menindak perizinan dari kamar Anda.");
  }
}

export function assertOwner(actor: Actor, p: GuardP) {
  if (actor.id !== p.userId) {
    throw new ForbiddenError("Anda hanya dapat menindak perizinan milik Anda sendiri.");
  }
}

export function requireAlasan(alasan?: string) {
  if (!alasan?.trim()) {
    throw new ValidationError("Alasan penolakan wajib diisi.", {
      alasanPenolakan: ["Alasan penolakan wajib diisi."],
    });
  }
}

export function assertCanView(actor: Actor, p: GuardP, ownerKamarId: number | null) {
  if (actor.role === "admin" || actor.role === "mudir") return;
  if (actor.id === p.userId) return;
  if (actor.role === "muaddib" && actor.kamarId != null && actor.kamarId === ownerKamarId) return;
  throw new ForbiddenError("Anda tidak memiliki akses ke perizinan ini.");
}
