import { Card, Text, Title } from "@mantine/core";

export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card withBorder padding="md" radius="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Title order={2} c={color}>
        {value}
      </Title>
    </Card>
  );
}
