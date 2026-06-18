import { Container, Text, Title } from "@mantine/core";

export function Placeholder({ title }: { title: string }) {
  return (
    <Container py="md">
      <Title order={2}>{title}</Title>
      <Text c="dimmed" mt="sm">
        Halaman ini akan diimplementasikan pada fase berikutnya.
      </Text>
    </Container>
  );
}
