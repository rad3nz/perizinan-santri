import { SegmentedControl } from "@mantine/core";
import type { PeriodKind } from "../lib/period";

export function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodKind;
  onChange: (value: PeriodKind) => void;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as PeriodKind)}
      data={[
        { value: "month", label: "Bulan ini" },
        { value: "week", label: "Minggu ini" },
      ]}
      size="sm"
    />
  );
}
