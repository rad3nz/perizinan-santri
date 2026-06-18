import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data, error } = await api.api.dashboard.stats.get();
      if (error) throw error;
      return data;
    },
  });
}
