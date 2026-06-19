import { Group, SegmentedControl, Stack, Text, ThemeIcon } from "@mantine/core";
import { CalendarRange } from "lucide-react";
import { formatRangeLabel, type PeriodKind, periodRange } from "../lib/period";

export function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodKind;
  onChange: (value: PeriodKind) => void;
}) {
  return (
    <Stack gap={4} align="flex-end">
      <Group gap={8} align="center" wrap="nowrap">
        <ThemeIcon variant="light" color="brand" size={30} radius="xl">
          <CalendarRange size={16} strokeWidth={1.75} />
        </ThemeIcon>
        <SegmentedControl
          value={value}
          onChange={(v) => onChange(v as PeriodKind)}
          color="brand"
          radius="xl"
          size="sm"
          withItemsBorders={false}
          data={[
            { value: "month", label: "Bulan ini" },
            { value: "week", label: "Minggu ini" },
          ]}
        />
      </Group>
      <Text size="xs" c="dimmed">
        {formatRangeLabel(periodRange(value))}
      </Text>
    </Stack>
  );
}
