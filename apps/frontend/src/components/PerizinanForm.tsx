import { Button, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { JENIS_IZIN, type JenisIzin } from "@perizinan/shared";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { jenisIzinLabel } from "../lib/labels";

export interface PerizinanFormValues {
  jenisIzin: JenisIzin;
  tujuan: string;
  tanggalKeluar: string | null;
  tanggalKembaliRencana: string | null;
  catatan: string;
}

export const blankPerizinanForm: PerizinanFormValues = {
  jenisIzin: "pulang",
  tujuan: "",
  tanggalKeluar: null,
  tanggalKembaliRencana: null,
  catatan: "",
};

interface PerizinanFormProps {
  initialValues: PerizinanFormValues;
  onSubmit: (
    values: PerizinanFormValues,
    helpers: { setErrors: (errors: Record<string, string>) => void },
  ) => void;
  loading?: boolean;
  submitLabel: string;
  submitIcon?: ReactNode;
}

export function PerizinanForm({
  initialValues,
  onSubmit,
  loading,
  submitLabel,
  submitIcon,
}: PerizinanFormProps) {
  const today = dayjs().format("YYYY-MM-DD");
  const form = useForm<PerizinanFormValues>({
    initialValues,
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

  const handleSubmit = form.onSubmit((values) => {
    if (!values.tanggalKeluar || !values.tanggalKembaliRencana) return;
    onSubmit(values, { setErrors: form.setErrors });
  });

  return (
    <form onSubmit={handleSubmit}>
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
          minDate={today}
          {...form.getInputProps("tanggalKeluar")}
        />
        <DatePickerInput
          label="Rencana Kembali"
          required
          valueFormat="DD MMM YYYY"
          minDate={today}
          {...form.getInputProps("tanggalKembaliRencana")}
        />
        <Textarea label="Catatan" rows={3} {...form.getInputProps("catatan")} />
        <Button type="submit" color="brand" loading={loading} leftSection={submitIcon}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
