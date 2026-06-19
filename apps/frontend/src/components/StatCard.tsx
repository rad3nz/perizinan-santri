import { Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number | string;
  color?: string;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <Card withBorder padding="md" radius="md" className="motion-hover-lift">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={2}>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Title order={2} c={color ? `${color}.8` : undefined}>
            {value}
          </Title>
          {hint ? (
            <Text size="xs" c="dimmed" fw={500}>
              {hint}
            </Text>
          ) : null}
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
