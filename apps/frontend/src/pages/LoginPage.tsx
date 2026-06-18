import { Button, Card, Center, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../auth/auth-store";
import { roleHome } from "../lib/role-home";

export function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm({ initialValues: { username: "", password: "" } });

  if (user) return <Navigate to={roleHome(user.role)} replace />;

  const submit = form.onSubmit(async (values) => {
    setError(null);
    setLoading(true);
    const { data, error: err } = await api.api.auth.login.post(values);
    setLoading(false);
    if (err || !data?.data) {
      setError("Username atau password salah.");
      return;
    }
    setSession(data.data.token, data.data.user);
    navigate(roleHome(data.data.user.role), { replace: true });
  });

  return (
    <Center h="100vh" bg="navy.8">
      <Card withBorder shadow="md" padding="xl" radius="md" w={360}>
        <form onSubmit={submit}>
          <Stack>
            <Title order={2} ta="center">
              Perizinan Santri
            </Title>
            <TextInput label="Username" required {...form.getInputProps("username")} />
            <PasswordInput label="Password" required {...form.getInputProps("password")} />
            {error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : null}
            <Button type="submit" color="brand" loading={loading} fullWidth>
              Masuk
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  );
}
