import { Box, Button, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { type PerizinanStatus, TRANSITIONS } from "@perizinan/shared";
import { Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { type MouseEvent, useState } from "react";
import {
  useApproveMuaddib,
  useApproveMudir,
  useDeletePerizinan,
  useEditMuaddib,
  useEditMudir,
  useRejectMuaddib,
  useRejectMudir,
} from "../api/hooks/usePerizinan";
import type { Perizinan } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { ApproveModal } from "./ApproveModal";
import { ConfirmModal } from "./ConfirmModal";
import { EditApprovalModal } from "./EditApprovalModal";
import { EditPerizinanModal } from "./EditPerizinanModal";
import { RejectModal } from "./RejectModal";

const MUADDIB_EDITABLE: PerizinanStatus[] = ["menunggu_mudir", "ditolak_muaddib"];
const MUDIR_EDITABLE: PerizinanStatus[] = ["disetujui", "ditolak_mudir"];

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: { message?: string } }).value;
    if (value?.message) return value.message;
  }
  return "Terjadi kesalahan.";
}

type Mode = "act" | "edit" | null;

export function PerizinanRowActions({ perizinan }: { perizinan: Perizinan }) {
  const { user } = useAuth();
  const id = perizinan.id;
  const status = perizinan.status;
  const role = user?.role;

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [editApprovalOpen, setEditApprovalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const approveMuaddib = useApproveMuaddib(id);
  const rejectMuaddib = useRejectMuaddib(id);
  const approveMudir = useApproveMudir(id);
  const rejectMudir = useRejectMudir(id);
  const editMuaddib = useEditMuaddib(id);
  const editMudir = useEditMudir(id);
  const del = useDeletePerizinan();

  const notifyError = (error: unknown) =>
    notifications.show({ color: "red", message: errorMessage(error) });
  const notifyOk = (message: string) => notifications.show({ color: "brand", message });

  const isOwner = perizinan.santri.id === user?.id;
  const canEdit = role === "santri" && isOwner && status === "menunggu_muaddib";
  const canDelete =
    (role === "santri" && isOwner && status === "menunggu_muaddib") || role === "admin";

  const muaddibMode: Mode =
    role === "muaddib"
      ? status === TRANSITIONS["approve-muaddib"].from
        ? "act"
        : MUADDIB_EDITABLE.includes(status) && perizinan.santri.kamar?.id === user?.kamarId
          ? "edit"
          : null
      : null;
  const mudirMode: Mode =
    role === "mudir"
      ? status === TRANSITIONS["approve-mudir"].from
        ? "act"
        : MUDIR_EDITABLE.includes(status)
          ? "edit"
          : null
      : null;
  // Which approver level is active, split by whether this is a first decision (act)
  // or a revision of an existing one (edit).
  const actLevel = muaddibMode === "act" ? "muaddib" : mudirMode === "act" ? "mudir" : null;
  const editLevel = muaddibMode === "edit" ? "muaddib" : mudirMode === "edit" ? "mudir" : null;
  const showApproval = actLevel !== null || editLevel !== null;

  if (!canEdit && !canDelete && !showApproval) return null;

  const doApprove = (catatan?: string) => {
    const ok = () => {
      setApproveOpen(false);
      notifyOk("Perizinan disetujui.");
    };
    if (actLevel === "muaddib")
      approveMuaddib.mutate({ catatan }, { onSuccess: ok, onError: notifyError });
    else if (actLevel === "mudir")
      approveMudir.mutate({ catatan }, { onSuccess: ok, onError: notifyError });
  };

  const doReject = (alasanPenolakan: string) => {
    const ok = () => {
      setRejectOpen(false);
      notifyOk("Perizinan ditolak.");
    };
    if (actLevel === "muaddib")
      rejectMuaddib.mutate({ alasanPenolakan }, { onSuccess: ok, onError: notifyError });
    else if (actLevel === "mudir")
      rejectMudir.mutate({ alasanPenolakan }, { onSuccess: ok, onError: notifyError });
  };

  // The approver's existing decision, derived from status, to pre-fill the edit modal.
  const currentDecision: "approve" | "reject" = status.startsWith("ditolak") ? "reject" : "approve";
  const currentNote =
    currentDecision === "reject"
      ? perizinan.alasanPenolakan
      : editLevel === "mudir"
        ? perizinan.mudirCatatan
        : perizinan.muaddibCatatan;

  const doEditApproval = (decision: "approve" | "reject", note?: string) => {
    const edit = editLevel === "mudir" ? editMudir : editMuaddib;
    const body =
      decision === "approve" ? { decision, catatan: note } : { decision, alasanPenolakan: note };
    edit.mutate(body, {
      onSuccess: () => {
        setEditApprovalOpen(false);
        notifyOk("Persetujuan diperbarui.");
      },
      onError: notifyError,
    });
  };

  const approveLoading = approveMuaddib.isPending || approveMudir.isPending;
  const rejectLoading = rejectMuaddib.isPending || rejectMudir.isPending;
  const editApprovalLoading = editMuaddib.isPending || editMudir.isPending;

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <Box onClick={stop}>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            size="xs"
            variant="light"
            rightSection={<ChevronDown size={14} strokeWidth={1.75} />}
          >
            Aksi
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {actLevel ? (
            <>
              <Menu.Item
                color="green"
                leftSection={<Check size={16} strokeWidth={1.75} />}
                onClick={() => setApproveOpen(true)}
              >
                Setujui
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<X size={16} strokeWidth={1.75} />}
                onClick={() => setRejectOpen(true)}
              >
                Tolak
              </Menu.Item>
            </>
          ) : null}
          {editLevel ? (
            <Menu.Item
              leftSection={<Pencil size={16} strokeWidth={1.75} />}
              onClick={() => setEditApprovalOpen(true)}
            >
              Edit Persetujuan
            </Menu.Item>
          ) : null}
          {canEdit ? (
            <Menu.Item
              leftSection={<Pencil size={16} strokeWidth={1.75} />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Menu.Item>
          ) : null}
          {canDelete ? (
            <Menu.Item
              color="red"
              leftSection={<Trash2 size={16} strokeWidth={1.75} />}
              onClick={() => setDeleteOpen(true)}
            >
              Hapus
            </Menu.Item>
          ) : null}
        </Menu.Dropdown>
      </Menu>

      {actLevel ? (
        <>
          <ApproveModal
            opened={approveOpen}
            onClose={() => setApproveOpen(false)}
            loading={approveLoading}
            onSubmit={doApprove}
          />
          <RejectModal
            opened={rejectOpen}
            onClose={() => setRejectOpen(false)}
            loading={rejectLoading}
            onSubmit={doReject}
          />
        </>
      ) : null}
      {editLevel ? (
        <EditApprovalModal
          opened={editApprovalOpen}
          onClose={() => setEditApprovalOpen(false)}
          loading={editApprovalLoading}
          initialDecision={currentDecision}
          initialNote={currentNote}
          onSubmit={doEditApproval}
        />
      ) : null}
      {canEdit ? (
        <EditPerizinanModal
          perizinan={perizinan}
          opened={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {canDelete ? (
        <ConfirmModal
          opened={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          loading={del.isPending}
          title="Hapus Perizinan"
          message="Yakin ingin menghapus perizinan ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          confirmColor="red"
          onConfirm={() =>
            del.mutate(id, {
              onSuccess: () => {
                setDeleteOpen(false);
                notifyOk("Perizinan dihapus.");
              },
              onError: notifyError,
            })
          }
        />
      ) : null}
    </Box>
  );
}
