import type { Role } from "@perizinan/shared";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors";
import { toUserDTO } from "../users/dto";
import { usersRepo } from "../users/repository";

// `sub` is signed as a string (JWT reserved-claim requirement); the auth macro
// reads it back with `Number(payload.sub)`.
type SignFn = (payload: { sub: string; role: Role; kamarId: number | null }) => Promise<string>;

export async function login(username: string, password: string, sign: SignFn) {
  const user = await usersRepo.findByUsername(username);
  if (!user || !(await Bun.password.verify(password, user.password))) {
    throw new UnauthorizedError("Username atau password salah.");
  }
  const token = await sign({ sub: String(user.id), role: user.role, kamarId: user.kamarId });
  return { token, user: toUserDTO(user) };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await usersRepo.findById(userId);
  if (!user) throw new NotFoundError();
  if (!(await Bun.password.verify(currentPassword, user.password))) {
    throw new ValidationError("Input tidak valid.", {
      currentPassword: ["Password saat ini salah."],
    });
  }
  await usersRepo.update(userId, { password: await Bun.password.hash(newPassword) });
}
