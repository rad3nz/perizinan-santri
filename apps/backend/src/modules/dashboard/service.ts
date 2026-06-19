import { dashboardRepo, type Period } from "./repository";

export function getStats(
  user: { id: number; role: string; kamarId: number | null },
  period?: Period,
) {
  if (user.role === "santri") return dashboardRepo.santriStats(user.id, period);
  if (user.role === "muaddib") return dashboardRepo.staffStats(user.kamarId ?? undefined, period);
  return dashboardRepo.staffStats(undefined, period); // admin + mudir: system-wide
}
