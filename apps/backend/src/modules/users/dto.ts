import type { UserRow } from "./repository";

export function toUserDTO(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    kamarId: u.kamarId,
    kamar: u.kamar ? { id: u.kamar.id, nama: u.kamar.nama } : null,
    nis: u.nis,
    kelas: u.kelas,
    waliTelepon: u.waliTelepon,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

export type UserDTO = ReturnType<typeof toUserDTO>;
