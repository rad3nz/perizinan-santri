import { dashboardRepo } from "./repository";

export function getStats(user: { id: number; role: string; kamarId: number | null }) {
  if (user.role === "santri") return dashboardRepo.santriStats(user.id);
  if (user.role === "muaddib") return dashboardRepo.staffStats(user.kamarId ?? undefined);
  return dashboardRepo.staffStats(); // admin + mudir: system-wide
}
