import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

export function useDashboardStats(params?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ["dashboard", params],
    queryFn: async () => {
      const { data, error } = await api.api.dashboard.stats.get({ query: params ?? {} });
      if (error) throw error;
      return data;
    },
  });
}
