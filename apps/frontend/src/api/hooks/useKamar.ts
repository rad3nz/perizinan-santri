import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

type KamarBody = Parameters<typeof api.api.kamar.post>[0];

export function useKamarList() {
  return useQuery({
    queryKey: ["kamar"],
    queryFn: async () => {
      const { data, error } = await api.api.kamar.get();
      if (error) throw error;
      return data;
    },
  });
}

export function useKamarDetail(id: number) {
  return useQuery({
    queryKey: ["kamar", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data, error } = await api.api.kamar({ id }).get();
      if (error) throw error;
      return data;
    },
  });
}

function useKamarMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kamar"] }),
  });
}

export function useCreateKamar() {
  return useKamarMutation(async (body: KamarBody) => {
    const { data, error } = await api.api.kamar.post(body);
    if (error) throw error;
    return data;
  });
}

export function useUpdateKamar(id: number) {
  return useKamarMutation(async (body: KamarBody) => {
    const { data, error } = await api.api.kamar({ id }).put(body);
    if (error) throw error;
    return data;
  });
}

export function useDeleteKamar() {
  return useKamarMutation(async (id: number) => {
    const { data, error } = await api.api.kamar({ id }).delete();
    if (error) throw error;
    return data;
  });
}
