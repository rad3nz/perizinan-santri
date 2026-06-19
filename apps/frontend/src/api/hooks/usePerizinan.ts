import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

type ListParams = NonNullable<Parameters<typeof api.api.perizinan.get>[0]>["query"];
type WriteBody = Parameters<typeof api.api.perizinan.post>[0];
type ApproveBody = { catatan?: string };
type RejectBody = { alasanPenolakan: string };
type EditDecisionBody = {
  decision: "approve" | "reject";
  catatan?: string;
  alasanPenolakan?: string;
};

const invalidates = ["perizinan", "dashboard"] as const;

export function usePerizinanList(params: ListParams) {
  return useQuery({
    queryKey: ["perizinan", params],
    queryFn: async () => {
      const { data, error } = await api.api.perizinan.get({ query: params });
      if (error) throw error;
      return data;
    },
  });
}

export function usePerizinanDetail(id: number) {
  return useQuery({
    queryKey: ["perizinan", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const { data, error } = await api.api.perizinan({ id }).get();
      if (error) throw error;
      return data;
    },
  });
}

function useInvalidatingMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of invalidates) qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function useCreatePerizinan() {
  return useInvalidatingMutation(async (body: WriteBody) => {
    const { data, error } = await api.api.perizinan.post(body);
    if (error) throw error;
    return data;
  });
}

export function useUpdatePerizinan(id: number) {
  return useInvalidatingMutation(async (body: WriteBody) => {
    const { data, error } = await api.api.perizinan({ id }).put(body);
    if (error) throw error;
    return data;
  });
}

export function useDeletePerizinan() {
  return useInvalidatingMutation(async (id: number) => {
    const { data, error } = await api.api.perizinan({ id }).delete();
    if (error) throw error;
    return data;
  });
}

export function useApproveMuaddib(id: number) {
  return useInvalidatingMutation(async (body: ApproveBody) => {
    const { data, error } = await api.api.perizinan({ id })["approve-muaddib"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useRejectMuaddib(id: number) {
  return useInvalidatingMutation(async (body: RejectBody) => {
    const { data, error } = await api.api.perizinan({ id })["reject-muaddib"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useApproveMudir(id: number) {
  return useInvalidatingMutation(async (body: ApproveBody) => {
    const { data, error } = await api.api.perizinan({ id })["approve-mudir"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useRejectMudir(id: number) {
  return useInvalidatingMutation(async (body: RejectBody) => {
    const { data, error } = await api.api.perizinan({ id })["reject-mudir"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useEditMuaddib(id: number) {
  return useInvalidatingMutation(async (body: EditDecisionBody) => {
    const { data, error } = await api.api.perizinan({ id })["edit-muaddib"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useEditMudir(id: number) {
  return useInvalidatingMutation(async (body: EditDecisionBody) => {
    const { data, error } = await api.api.perizinan({ id })["edit-mudir"].patch(body);
    if (error) throw error;
    return data;
  });
}

export function useBerangkat(id: number) {
  return useInvalidatingMutation(async () => {
    const { data, error } = await api.api.perizinan({ id }).berangkat.patch();
    if (error) throw error;
    return data;
  });
}

export function useKembali(id: number) {
  return useInvalidatingMutation(async () => {
    const { data, error } = await api.api.perizinan({ id }).kembali.patch();
    if (error) throw error;
    return data;
  });
}
