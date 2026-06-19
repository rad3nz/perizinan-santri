import { Box, Button, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TRANSITIONS } from "@perizinan/shared";
import { Check, ChevronDown, X } from "lucide-react";
import { type MouseEvent, useState } from "react";
import {
  useApproveMuaddib,
  useApproveMudir,
  useRejectMuaddib,
  useRejectMudir,
} from "../api/hooks/usePerizinan";
import type { Perizinan } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { ApproveModal } from "./ApproveModal";
import { RejectModal } from "./RejectModal";

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: { message?: string } }).value;
    if (value?.message) return value.message;
  }
  return "Terjadi kesalahan.";
}

export function PerizinanRowActions({ perizinan }: { perizinan: Perizinan }) {
  const { user } = useAuth();
  const id = perizinan.id;
  const status = perizinan.status;
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const approveMuaddib = useApproveMuaddib(id);
  const rejectMuaddib = useRejectMuaddib(id);
  const approveMudir = useApproveMudir(id);
  const rejectMudir = useRejectMudir(id);

  const notifyError = (error: unknown) =>
    notifications.show({ color: "red", message: errorMessage(error) });
  const notifyOk = (message: string) => notifications.show({ color: "brand", message });

  const role = user?.role;
  const canMuaddib = role === "muaddib" && status === TRANSITIONS["approve-muaddib"].from;
  const canMudir = role === "mudir" && status === TRANSITIONS["approve-mudir"].from;
  if (!canMuaddib && !canMudir) return null;

  const approve = canMuaddib ? approveMuaddib : approveMudir;
  const reject = canMuaddib ? rejectMuaddib : rejectMudir;

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
        </Menu.Dropdown>
      </Menu>
      <ApproveModal
        opened={approveOpen}
        onClose={() => setApproveOpen(false)}
        loading={approve.isPending}
        onSubmit={(catatan) =>
          approve.mutate(
            { catatan },
            {
              onSuccess: () => {
                setApproveOpen(false);
                notifyOk("Perizinan disetujui.");
              },
              onError: notifyError,
            },
          )
        }
      />
      <RejectModal
        opened={rejectOpen}
        onClose={() => setRejectOpen(false)}
        loading={reject.isPending}
        onSubmit={(alasanPenolakan) =>
          reject.mutate(
            { alasanPenolakan },
            {
              onSuccess: () => {
                setRejectOpen(false);
                notifyOk("Perizinan ditolak.");
              },
              onError: notifyError,
            },
          )
        }
      />
    </Box>
  );
}
