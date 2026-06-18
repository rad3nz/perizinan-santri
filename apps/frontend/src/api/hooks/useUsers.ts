import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

type CreateUserBody = Parameters<typeof api.api.users.post>[0];
type UpdateUserBody = Parameters<ReturnType<typeof api.api.users>["put"]>[0];

export function useUsersList() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await api.api.users.get();
      if (error) throw error;
      return data;
    },
  });
}

export function useUserDetail(id: number) {
  return useQuery({
    queryKey: ["users", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data, error } = await api.api.users({ id }).get();
      if (error) throw error;
      return data;
    },
  });
}

function useUserMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useCreateUser() {
  return useUserMutation(async (body: CreateUserBody) => {
    const { data, error } = await api.api.users.post(body);
    if (error) throw error;
    return data;
  });
}

export function useUpdateUser(id: number) {
  return useUserMutation(async (body: UpdateUserBody) => {
    const { data, error } = await api.api.users({ id }).put(body);
    if (error) throw error;
    return data;
  });
}

export function useDeleteUser() {
  return useUserMutation(async (id: number) => {
    const { data, error } = await api.api.users({ id }).delete();
    if (error) throw error;
    return data;
  });
}
