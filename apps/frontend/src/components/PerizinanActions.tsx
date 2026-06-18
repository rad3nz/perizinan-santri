import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TRANSITIONS } from "@perizinan/shared";
import { useState } from "react";
import {
  useApproveMuaddib,
  useApproveMudir,
  useBerangkat,
  useKembali,
  useRejectMuaddib,
  useRejectMudir,
} from "../api/hooks/usePerizinan";
import type { Perizinan } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { RejectModal } from "./RejectModal";

function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "value" in error) {
    const value = (error as { value?: { message?: string } }).value;
    if (value?.message) return value.message;
  }
  return "Terjadi kesalahan.";
}

export function PerizinanActions({ perizinan }: { perizinan: Perizinan }) {
  const { user } = useAuth();
  const id = perizinan.id;
  const status = perizinan.status;

  const berangkat = useBerangkat(id);
  const kembali = useKembali(id);
  const approveMuaddib = useApproveMuaddib(id);
  const rejectMuaddib = useRejectMuaddib(id);
  const approveMudir = useApproveMudir(id);
  const rejectMudir = useRejectMudir(id);
  const [rejectOpen, setRejectOpen] = useState(false);

  const notifyError = (error: unknown) =>
    notifications.show({ color: "red", message: errorMessage(error) });
  const notifyOk = (message: string) => notifications.show({ color: "brand", message });

  if (user?.role === "santri") {
    return (
      <Group>
        <Button
          color="brand"
          disabled={status !== TRANSITIONS.berangkat.from}
          loading={berangkat.isPending}
          onClick={() =>
            berangkat.mutate(undefined, {
              onSuccess: () => notifyOk("Status diperbarui menjadi Berangkat."),
              onError: notifyError,
            })
          }
        >
          Berangkat
        </Button>
        <Button
          color="brand"
          disabled={status !== TRANSITIONS.kembali.from}
          loading={kembali.isPending}
          onClick={() =>
            kembali.mutate(undefined, {
              onSuccess: () => notifyOk("Status diperbarui menjadi Kembali."),
              onError: notifyError,
            })
          }
        >
          Kembali
        </Button>
      </Group>
    );
  }

  if (user?.role === "muaddib" && status === TRANSITIONS["approve-muaddib"].from) {
    return (
      <>
        <Group>
          <Button
            color="brand"
            loading={approveMuaddib.isPending}
            onClick={() =>
              approveMuaddib.mutate(
                {},
                { onSuccess: () => notifyOk("Perizinan disetujui."), onError: notifyError },
              )
            }
          >
            Setujui
          </Button>
          <Button color="red" variant="light" onClick={() => setRejectOpen(true)}>
            Tolak
          </Button>
        </Group>
        <RejectModal
          opened={rejectOpen}
          onClose={() => setRejectOpen(false)}
          loading={rejectMuaddib.isPending}
          onSubmit={(alasanPenolakan) =>
            rejectMuaddib.mutate(
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
      </>
    );
  }

  if (user?.role === "mudir" && status === TRANSITIONS["approve-mudir"].from) {
    return (
      <>
        <Group>
          <Button
            color="brand"
            loading={approveMudir.isPending}
            onClick={() =>
              approveMudir.mutate(
                {},
                { onSuccess: () => notifyOk("Perizinan disetujui."), onError: notifyError },
              )
            }
          >
            Setujui
          </Button>
          <Button color="red" variant="light" onClick={() => setRejectOpen(true)}>
            Tolak
          </Button>
        </Group>
        <RejectModal
          opened={rejectOpen}
          onClose={() => setRejectOpen(false)}
          loading={rejectMudir.isPending}
          onSubmit={(alasanPenolakan) =>
            rejectMudir.mutate(
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
      </>
    );
  }

  return null;
}
