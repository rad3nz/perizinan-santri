import { Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={2}>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Title order={2} c={color}>
            {value}
          </Title>
        </Stack>
        {Icon ? (
          <ThemeIcon variant="light" color={color ?? "brand"} size={38} radius="md">
            <Icon size={20} strokeWidth={1.75} />
          </ThemeIcon>
        ) : null}
      </Group>
    </Card>
  );
}
