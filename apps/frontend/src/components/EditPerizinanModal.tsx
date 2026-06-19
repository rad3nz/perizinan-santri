import { Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Save } from "lucide-react";
import { useUpdatePerizinan } from "../api/hooks/usePerizinan";
import type { Perizinan } from "../api/types";
import { serverErrors, serverMessage } from "../lib/api-error";
import { PerizinanForm, type PerizinanFormValues } from "./PerizinanForm";

interface EditPerizinanModalProps {
  perizinan: Perizinan;
  opened: boolean;
  onClose: () => void;
}

export function EditPerizinanModal({ perizinan, opened, onClose }: EditPerizinanModalProps) {
  const update = useUpdatePerizinan(perizinan.id);
  const initialValues: PerizinanFormValues = {
    jenisIzin: perizinan.jenisIzin,
    tujuan: perizinan.tujuan,
    tanggalKeluar: perizinan.tanggalKeluar,
    tanggalKembaliRencana: perizinan.tanggalKembaliRencana,
    catatan: perizinan.catatan ?? "",
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Perizinan"
      centered
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <PerizinanForm
        initialValues={initialValues}
        loading={update.isPending}
        submitLabel="Simpan"
        submitIcon={<Save size={16} strokeWidth={1.75} />}
        onSubmit={(values, { setErrors }) =>
          update.mutate(
            {
              jenisIzin: values.jenisIzin,
              tujuan: values.tujuan,
              tanggalKeluar: values.tanggalKeluar as string,
              tanggalKembaliRencana: values.tanggalKembaliRencana as string,
              catatan: values.catatan.trim() || null,
            },
            {
              onSuccess: () => {
                notifications.show({ color: "brand", message: "Perizinan diperbarui." });
                onClose();
              },
              onError: (err) => {
                const fieldErrors = serverErrors(err);
                if (fieldErrors) setErrors(fieldErrors);
                else notifications.show({ color: "red", message: serverMessage(err) });
              },
            },
          )
        }
      />
    </Modal>
  );
}
