import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function AksesDitolak() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title order={1} c="red">
          403
        </Title>
        <Title order={3}>Akses ditolak</Title>
        <Text c="dimmed" ta="center">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </Text>
        <Button component={Link} to="/" variant="default">
          Kembali
        </Button>
      </Stack>
    </Container>
  );
}
