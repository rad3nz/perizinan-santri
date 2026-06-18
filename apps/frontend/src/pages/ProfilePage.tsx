import { Button, Card, Group, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/useAuth";
import { serverErrors, serverMessage } from "../lib/api-error";

const ROLE_LABELS: Record<string, string> = {
  santri: "Santri",
  muaddib: "Muaddib",
  mudir: "Mudir",
  admin: "Admin",
};

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  konfirmasi: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between">
      <Text c="dimmed">{label}</Text>
      <Text fw={500}>{value}</Text>
    </Group>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm<PasswordFormValues>({
    initialValues: { currentPassword: "", newPassword: "", konfirmasi: "" },
    validate: {
      currentPassword: (v) => (v ? null : "Wajib diisi."),
      newPassword: (v) => (v.length >= 6 ? null : "Kata sandi minimal 6 karakter."),
      konfirmasi: (v, values) => (v === values.newPassword ? null : "Konfirmasi tidak cocok."),
    },
  });

  const submit = form.onSubmit(async (values) => {
    setLoading(true);
    const { error } = await api.api.auth.password.patch({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    setLoading(false);
    if (error) {
      const fieldErrors = serverErrors(error);
      if (fieldErrors) form.setErrors(fieldErrors);
      else notifications.show({ color: "red", message: serverMessage(error) });
      return;
    }
    notifications.show({ color: "brand", message: "Kata sandi berhasil diubah." });
    form.reset();
  });

  if (!user) return null;

  return (
    <Stack maw={520}>
      <Title order={2}>Profil</Title>
      <Card withBorder padding="lg" radius="md">
        <Stack gap="xs">
          <InfoRow label="Nama" value={user.name} />
          <InfoRow label="Username" value={user.username} />
          <InfoRow label="Peran" value={ROLE_LABELS[user.role] ?? user.role} />
          {user.kamar ? <InfoRow label="Kamar" value={user.kamar.nama} /> : null}
          {user.nis ? <InfoRow label="NIS" value={user.nis} /> : null}
          {user.kelas ? <InfoRow label="Kelas" value={user.kelas} /> : null}
          {user.waliTelepon ? <InfoRow label="Telepon Wali" value={user.waliTelepon} /> : null}
        </Stack>
      </Card>
      <Card withBorder padding="lg" radius="md">
        <Title order={4} mb="md">
          Ganti Kata Sandi
        </Title>
        <form onSubmit={submit}>
          <Stack>
            <PasswordInput
              label="Kata sandi saat ini"
              required
              {...form.getInputProps("currentPassword")}
            />
            <PasswordInput
              label="Kata sandi baru"
              required
              {...form.getInputProps("newPassword")}
            />
            <PasswordInput
              label="Konfirmasi kata sandi"
              required
              {...form.getInputProps("konfirmasi")}
            />
            <Button type="submit" color="brand" loading={loading}>
              Simpan
            </Button>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
