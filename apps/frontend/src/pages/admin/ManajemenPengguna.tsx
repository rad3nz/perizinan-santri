import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { ROLES, type Role } from "@perizinan/shared";
import { useState } from "react";
import { useKamarList } from "../../api/hooks/useKamar";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsersList,
} from "../../api/hooks/useUsers";
import type { AppUser } from "../../api/types";
import { type Column, DataTable } from "../../components/DataTable";
import { serverErrors, serverMessage } from "../../lib/api-error";

const ROLE_LABELS: Record<Role, string> = {
  santri: "Santri",
  muaddib: "Muaddib",
  mudir: "Mudir",
  admin: "Admin",
};

interface UserFormValues {
  name: string;
  username: string;
  role: Role;
  kamarId: string | null;
  nis: string;
  kelas: string;
  waliTelepon: string;
  password: string;
}

function UserFormModal({
  pengguna,
  opened,
  onClose,
}: {
  pengguna: AppUser | null;
  opened: boolean;
  onClose: () => void;
}) {
  const create = useCreateUser();
  const update = useUpdateUser(pengguna?.id ?? 0);
  const kamarQuery = useKamarList();
  const kamarOptions =
    kamarQuery.data?.data.items.map((k) => ({ value: String(k.id), label: k.nama })) ?? [];

  // Remounted via `key` on each open (see parent), so initialValues from props suffice.
  const form = useForm<UserFormValues>({
    initialValues: {
      name: pengguna?.name ?? "",
      username: pengguna?.username ?? "",
      role: pengguna?.role ?? "santri",
      kamarId: pengguna?.kamarId != null ? String(pengguna.kamarId) : null,
      nis: pengguna?.nis ?? "",
      kelas: pengguna?.kelas ?? "",
      waliTelepon: pengguna?.waliTelepon ?? "",
      password: "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Nama wajib diisi."),
      username: (v) => (v.trim().length >= 3 ? null : "Username minimal 3 karakter."),
      password: (v) => (pengguna || v.length >= 6 ? null : "Kata sandi minimal 6 karakter."),
    },
  });

  const role = form.values.role;
  const needsKamar = role === "santri" || role === "muaddib";
  const isSantri = role === "santri";

  const submit = form.onSubmit((values) => {
    const base = {
      name: values.name,
      username: values.username,
      role: values.role,
      kamarId: needsKamar && values.kamarId ? Number(values.kamarId) : null,
      nis: isSantri ? values.nis : null,
      kelas: isSantri ? values.kelas : null,
      waliTelepon: isSantri ? values.waliTelepon : null,
    };
    const handlers = {
      onSuccess: () => {
        notifications.show({ color: "brand", message: "Pengguna tersimpan." });
        onClose();
      },
      onError: (err: unknown) => {
        const fieldErrors = serverErrors(err);
        if (fieldErrors) form.setErrors(fieldErrors);
        else notifications.show({ color: "red", message: serverMessage(err) });
      },
    };
    if (pengguna) {
      update.mutate(
        { ...base, ...(values.password ? { password: values.password } : {}) },
        handlers,
      );
    } else {
      create.mutate({ ...base, password: values.password }, handlers);
    }
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={pengguna ? "Edit Pengguna" : "Tambah Pengguna"}
      centered
    >
      <form onSubmit={submit}>
        <Stack>
          <TextInput label="Nama" required {...form.getInputProps("name")} />
          <TextInput label="Username" required {...form.getInputProps("username")} />
          <Select
            label="Peran"
            allowDeselect={false}
            data={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            {...form.getInputProps("role")}
          />
          {needsKamar ? (
            <Select
              label="Kamar"
              clearable
              data={kamarOptions}
              {...form.getInputProps("kamarId")}
            />
          ) : null}
          {isSantri ? (
            <>
              <TextInput label="NIS" {...form.getInputProps("nis")} />
              <TextInput label="Kelas" {...form.getInputProps("kelas")} />
              <TextInput label="Telepon Wali" {...form.getInputProps("waliTelepon")} />
            </>
          ) : null}
          <PasswordInput
            label={pengguna ? "Kata sandi baru (opsional)" : "Kata sandi"}
            required={!pengguna}
            {...form.getInputProps("password")}
          />
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

export function ManajemenPengguna() {
  const query = useUsersList();
  const del = useDeleteUser();
  const [target, setTarget] = useState<AppUser | null>(null);
  const [opened, setOpened] = useState(false);

  const remove = (pengguna: AppUser) => {
    if (!window.confirm(`Hapus pengguna "${pengguna.name}"?`)) return;
    del.mutate(pengguna.id, {
      onSuccess: () => notifications.show({ color: "brand", message: "Pengguna dihapus." }),
      onError: (err) => notifications.show({ color: "red", message: serverMessage(err) }),
    });
  };

  const columns: Column<AppUser>[] = [
    { header: "Nama", render: (r) => r.name },
    { header: "Username", render: (r) => r.username },
    { header: "Peran", render: (r) => ROLE_LABELS[r.role] },
    { header: "Kamar", render: (r) => r.kamar?.nama ?? "-" },
    {
      header: "Aksi",
      render: (r) => (
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              setTarget(r);
              setOpened(true);
            }}
          >
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
        <Title order={2}>Manajemen Pengguna</Title>
        <Button
          color="brand"
          onClick={() => {
            setTarget(null);
            setOpened(true);
          }}
        >
          Tambah Pengguna
        </Button>
      </Group>
      <DataTable
        columns={columns}
        rows={query.data?.data.items ?? []}
        rowKey={(r) => r.id}
        loading={query.isLoading}
      />
      <UserFormModal
        key={`${opened}-${target?.id ?? "new"}`}
        pengguna={target}
        opened={opened}
        onClose={() => setOpened(false)}
      />
    </Stack>
  );
}
