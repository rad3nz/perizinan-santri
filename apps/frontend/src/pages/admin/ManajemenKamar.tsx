import { Button, Group, Modal, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  useCreateKamar,
  useDeleteKamar,
  useKamarList,
  useUpdateKamar,
} from "../../api/hooks/useKamar";
import type { Kamar } from "../../api/types";
import { type Column, DataTable } from "../../components/DataTable";
import { serverErrors, serverMessage } from "../../lib/api-error";

interface KamarFormValues {
  nama: string;
  kapasitas: number;
}

function KamarFormModal({
  kamar,
  opened,
  onClose,
}: {
  kamar: Kamar | null;
  opened: boolean;
  onClose: () => void;
}) {
  const create = useCreateKamar();
  const update = useUpdateKamar(kamar?.id ?? 0);
  // Remounted via `key` on each open (see parent), so initialValues from props suffice.
  const form = useForm<KamarFormValues>({
    initialValues: { nama: kamar?.nama ?? "", kapasitas: kamar?.kapasitas ?? 0 },
    validate: { nama: (v) => (v.trim() ? null : "Nama wajib diisi.") },
  });

  const submit = form.onSubmit((values) => {
    const handlers = {
      onSuccess: () => {
        notifications.show({ color: "brand", message: "Kamar tersimpan." });
        onClose();
      },
      onError: (err: unknown) => {
        const fieldErrors = serverErrors(err);
        if (fieldErrors) form.setErrors(fieldErrors);
        else notifications.show({ color: "red", message: serverMessage(err) });
      },
    };
    if (kamar) update.mutate(values, handlers);
    else create.mutate(values, handlers);
  });

  return (
    <Modal opened={opened} onClose={onClose} title={kamar ? "Edit Kamar" : "Tambah Kamar"} centered>
      <form onSubmit={submit}>
        <Stack>
          <TextInput label="Nama" required {...form.getInputProps("nama")} />
          <NumberInput label="Kapasitas" min={0} {...form.getInputProps("kapasitas")} />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" color="brand" loading={create.isPending || update.isPending}>
              Simpan
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function ManajemenKamar() {
  const query = useKamarList();
  const del = useDeleteKamar();
  const [target, setTarget] = useState<Kamar | null>(null);
  const [opened, setOpened] = useState(false);

  const openAdd = () => {
    setTarget(null);
    setOpened(true);
  };
  const openEdit = (kamar: Kamar) => {
    setTarget(kamar);
    setOpened(true);
  };
  const remove = (kamar: Kamar) => {
    if (!window.confirm(`Hapus kamar "${kamar.nama}"?`)) return;
    del.mutate(kamar.id, {
      onSuccess: () => notifications.show({ color: "brand", message: "Kamar dihapus." }),
      onError: (err) => notifications.show({ color: "red", message: serverMessage(err) }),
    });
  };

  const columns: Column<Kamar>[] = [
    { header: "Nama", render: (r) => r.nama },
    { header: "Kapasitas", render: (r) => r.kapasitas },
    { header: "Penghuni", render: (r) => r.jumlahPenghuni },
    {
      header: "Aksi",
      render: (r) => (
        <Group gap="xs">
          <Button size="xs" variant="light" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button size="xs" color="red" variant="light" onClick={() => remove(r)}>
            Hapus
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Manajemen Kamar</Title>
        <Button color="brand" onClick={openAdd}>
          Tambah Kamar
        </Button>
      </Group>
      <DataTable
        columns={columns}
        rows={query.data?.data.items ?? []}
        rowKey={(r) => r.id}
        loading={query.isLoading}
      />
      <KamarFormModal
        key={`${opened}-${target?.id ?? "new"}`}
        kamar={target}
        opened={opened}
        onClose={() => setOpened(false)}
      />
    </Stack>
  );
}
