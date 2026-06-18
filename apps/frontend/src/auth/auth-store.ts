import type { Role } from "@perizinan/shared";
import { create } from "zustand";

const TOKEN_KEY = "perizinan_token";

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  role: Role;
  kamarId: number | null;
  kamar: { id: number; nama: string } | null;
  nis: string | null;
  kelas: string | null;
  waliTelepon: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },
}));

export const getToken = (): string | null =>
  useAuthStore.getState().token ?? localStorage.getItem(TOKEN_KEY);
