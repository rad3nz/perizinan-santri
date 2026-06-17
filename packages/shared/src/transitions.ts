import type { PerizinanStatus, Role } from "./enums";

/** Action keys map 1:1 to the PATCH endpoint suffixes in docs/05. */
export type PerizinanAction =
  | "approve-muaddib"
  | "reject-muaddib"
  | "approve-mudir"
  | "reject-mudir"
  | "berangkat"
  | "kembali";

/** The single legal "from" status for each action, the resulting "to" status, and who may act. */
export const TRANSITIONS: Record<
  PerizinanAction,
  { from: PerizinanStatus; to: PerizinanStatus; actor: Role | "owner" }
> = {
  "approve-muaddib": { from: "menunggu_muaddib", to: "menunggu_mudir", actor: "muaddib" },
  "reject-muaddib": { from: "menunggu_muaddib", to: "ditolak_muaddib", actor: "muaddib" },
  "approve-mudir": { from: "menunggu_mudir", to: "disetujui", actor: "mudir" },
  "reject-mudir": { from: "menunggu_mudir", to: "ditolak_mudir", actor: "mudir" },
  berangkat: { from: "disetujui", to: "berangkat", actor: "owner" },
  kembali: { from: "berangkat", to: "kembali", actor: "owner" },
};

export const TERMINAL_STATUSES: PerizinanStatus[] = ["ditolak_muaddib", "ditolak_mudir", "kembali"];
