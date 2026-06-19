import { Card, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreatePerizinan } from "../../api/hooks/usePerizinan";
import { blankPerizinanForm, PerizinanForm } from "../../components/PerizinanForm";
import { serverErrors, serverMessage } from "../../lib/api-error";

export function BuatPerizinan() {
  const navigate = useNavigate();
  const create = useCreatePerizinan();

  return (
    <Stack>
      <Title order={2} ta="center">
        Buat Perizinan
      </Title>
      <Card withBorder padding="lg" radius="md" maw={560} w="100%" mx="auto">
        <PerizinanForm
          initialValues={blankPerizinanForm}
          loading={create.isPending}
          submitLabel="Ajukan"
          submitIcon={<Send size={16} strokeWidth={1.75} />}
          onSubmit={(values, { setErrors }) =>
            create.mutate(
              {
                jenisIzin: values.jenisIzin,
                tujuan: values.tujuan,
                tanggalKeluar: values.tanggalKeluar as string,
                tanggalKembaliRencana: values.tanggalKembaliRencana as string,
                catatan: values.catatan.trim() || null,
              },
              {
                onSuccess: () => {
                  notifications.show({ color: "brand", message: "Perizinan berhasil diajukan." });
                  navigate("/santri/perizinan");
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
      </Card>
    </Stack>
  );
}
