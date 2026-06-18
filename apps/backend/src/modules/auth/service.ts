import type { Role } from "@perizinan/shared";
import { UnauthorizedError } from "../../lib/errors";
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
