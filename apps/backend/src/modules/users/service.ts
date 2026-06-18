import type { Role } from "@perizinan/shared";
import { ConflictError, NotFoundError, ValidationError } from "../../lib/errors";
import { toUserDTO } from "./dto";
import { usersRepo } from "./repository";

export type UserInput = {
  name: string;
  username: string;
  password?: string;
  role: Role;
  kamarId?: number | null;
  nis?: string | null;
  kelas?: string | null;
  waliTelepon?: string | null;
};

async function assertValid(input: UserInput, exceptId?: number) {
  const errors: Record<string, string[]> = {};
  const push = (key: string, msg: string) => {
    if (!errors[key]) errors[key] = [];
    errors[key].push(msg);
  };

  if ((input.role === "santri" || input.role === "muaddib") && input.kamarId == null) {
    push("kamarId", "Kamar wajib untuk santri/muaddib.");
  }
  if ((input.role === "mudir" || input.role === "admin") && input.kamarId != null) {
    push("kamarId", "Mudir/admin tidak boleh memiliki kamar.");
  }
  if (input.role === "santri") {
    if (!input.nis?.trim()) push("nis", "NIS wajib diisi.");
    if (!input.kelas?.trim()) push("kelas", "Kelas wajib diisi.");
    if (!input.waliTelepon?.trim()) push("waliTelepon", "Telepon wali wajib diisi.");
  }
  if (
    input.role === "muaddib" &&
    input.kamarId != null &&
    (await usersRepo.existsMuaddibForKamar(input.kamarId, exceptId))
  ) {
    push("kamarId", "Kamar ini sudah memiliki muaddib.");
  }
  if (await usersRepo.usernameTaken(input.username, exceptId)) {
    push("username", "Username sudah digunakan.");
  }

  if (Object.keys(errors).length) throw new ValidationError("Input tidak valid.", errors);
}

function normalize(input: UserInput) {
  return {
    name: input.name,
    username: input.username,
    role: input.role,
    kamarId: input.kamarId ?? null,
    nis: input.nis ?? null,
    kelas: input.kelas ?? null,
    waliTelepon: input.waliTelepon ?? null,
  };
}

export async function listUsers(params: {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  kamarId?: number;
}) {
  const { items, total } = await usersRepo.list(params);
  return { items: items.map(toUserDTO), total, page: params.page, limit: params.limit };
}

export async function getUser(id: number) {
  const row = await usersRepo.findById(id);
  if (!row) throw new NotFoundError();
  return toUserDTO(row);
}

export async function createUser(input: UserInput) {
  await assertValid(input);
  const password = await Bun.password.hash(input.password ?? "");
  const [{ id }] = await usersRepo.create({ ...normalize(input), password });
  return getUser(id);
}

export async function updateUser(id: number, input: UserInput) {
  if (!(await usersRepo.findById(id))) throw new NotFoundError();
  await assertValid(input, id);
  const base = normalize(input);
  const values = input.password
    ? { ...base, password: await Bun.password.hash(input.password) }
    : base;
  await usersRepo.update(id, values);
  return getUser(id);
}

export async function deleteUser(id: number) {
  if (!(await usersRepo.findById(id))) throw new NotFoundError();
  if (await usersRepo.ownsPerizinan(id)) {
    throw new ConflictError("Pengguna masih memiliki data perizinan dan tidak dapat dihapus.");
  }
  await usersRepo.delete(id);
}
