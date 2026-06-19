import type { api } from "./client";

// Unwraps an Eden call: Promise<{ data, error }> -> the success envelope's `data` payload.
type ResBody<T> = T extends Promise<{ data: infer D }> ? D : never;
type Payload<T> = NonNullable<ResBody<T>> extends { data: infer P } ? P : never;

export type PerizinanListPayload = Payload<ReturnType<typeof api.api.perizinan.get>>;
export type Perizinan = PerizinanListPayload["items"][number];

export type KamarListPayload = Payload<ReturnType<typeof api.api.kamar.get>>;
export type Kamar = KamarListPayload["items"][number];

export type UsersListPayload = Payload<ReturnType<typeof api.api.users.get>>;
export type AppUser = UsersListPayload["items"][number];

export type NotificationsPayload = Payload<ReturnType<typeof api.api.notifications.get>>;
export type NotificationItem = NotificationsPayload["items"][number];

// Dashboard stats are role-shaped (santri vs staff); declared explicitly since the
// endpoint's return type is a union the pages narrow by role.
export interface SantriStats {
  totalPerizinan: number;
  menunggu: number;
  disetujui: number;
  berangkat: number;
  ditolak: number;
}
export interface StaffStats {
  totalSantri: number;
  santriDiAsrama: number;
  menungguMuaddib: number;
  menungguMudir: number;
  disetujui: number;
  berangkat: number;
  kembaliHariIni: number;
}
