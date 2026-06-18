import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

type ListParams = NonNullable<Parameters<typeof api.api.notifications.get>[0]>["query"];

export function useNotificationsList(params?: ListParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const { data, error } = await api.api.notifications.get({ query: params ?? {} });
      if (error) throw error;
      return data;
    },
  });
}

function useNotificationMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkRead() {
  return useNotificationMutation(async (id: number) => {
    const { data, error } = await api.api.notifications({ id }).read.patch();
    if (error) throw error;
    return data;
  });
}

export function useMarkAllRead() {
  return useNotificationMutation(async () => {
    const { data, error } = await api.api.notifications["read-all"].patch();
    if (error) throw error;
    return data;
  });
}
