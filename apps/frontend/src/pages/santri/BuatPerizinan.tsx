import { Button, Card, Select, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { JENIS_IZIN, type JenisIzin } from "@perizinan/shared";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreatePerizinan } from "../../api/hooks/usePerizinan";
import { serverErrors, serverMessage } from "../../lib/api-error";
import { jenisIzinLabel } from "../../lib/labels";

interface FormValues {
  jenisIzin: JenisIzin;
  tujuan: string;
  tanggalKeluar: string | null;
  tanggalKembaliRencana: string | null;
  catatan: string;
}

export function BuatPerizinan() {
  const navigate = useNavigate();
  const create = useCreatePerizinan();

  const form = useForm<FormValues>({
    initialValues: {
      jenisIzin: "pulang",
      tujuan: "",
      tanggalKeluar: null,
      tanggalKembaliRencana: null,
      catatan: "",
    },
    validate: {
      tujuan: (v) => (v.trim() ? null : "Tujuan wajib diisi."),
      tanggalKeluar: (v) => (v ? null : "Tanggal keluar wajib diisi."),
      tanggalKembaliRencana: (v, values) => {
        if (!v) return "Tanggal kembali wajib diisi.";
        if (values.tanggalKeluar && v < values.tanggalKeluar) {
          return "Tanggal kembali harus setelah tanggal keluar.";
        }
        return null;
      },
    },
  });

  const submit = form.onSubmit((values) => {
    if (!values.tanggalKeluar || !values.tanggalKembaliRencana) return;
    create.mutate(
      {
        jenisIzin: values.jenisIzin,
        tujuan: values.tujuan,
        tanggalKeluar: values.tanggalKeluar,
        tanggalKembaliRencana: values.tanggalKembaliRencana,
        catatan: values.catatan.trim() || null,
      },
      {
        onSuccess: () => {
          notifications.show({ color: "brand", message: "Perizinan berhasil diajukan." });
          navigate("/santri/perizinan");
        },
        onError: (err) => {
          const fieldErrors = serverErrors(err);
          if (fieldErrors) form.setErrors(fieldErrors);
          else notifications.show({ color: "red", message: serverMessage(err) });
        },
      },
    );
  });

  return (
    <Stack>
      <Title order={2}>Buat Perizinan</Title>
      <Card withBorder padding="lg" radius="md" maw={560}>
        <form onSubmit={submit}>
          <Stack>
            <Select
              label="Jenis Izin"
              data={JENIS_IZIN.map((j) => ({ value: j, label: jenisIzinLabel(j) }))}
              allowDeselect={false}
              {...form.getInputProps("jenisIzin")}
            />
            <TextInput label="Tujuan" required {...form.getInputProps("tujuan")} />
            <DatePickerInput
              label="Tanggal Keluar"
              required
              valueFormat="DD MMM YYYY"
              {...form.getInputProps("tanggalKeluar")}
            />
            <DatePickerInput
              label="Rencana Kembali"
              required
              valueFormat="DD MMM YYYY"
              {...form.getInputProps("tanggalKembaliRencana")}
            />
            <Textarea label="Catatan" rows={3} {...form.getInputProps("catatan")} />
            <Button
              type="submit"
              color="brand"
              loading={create.isPending}
              leftSection={<Send size={16} strokeWidth={1.75} />}
            >
              Ajukan
            </Button>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
