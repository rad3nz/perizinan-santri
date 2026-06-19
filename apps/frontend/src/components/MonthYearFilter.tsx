import { Group, Select } from "@mantine/core";
import { MONTH_OPTIONS, yearOptions } from "../lib/period";

interface MonthYearFilterProps {
  month: string | null;
  year: string;
  onMonth: (value: string | null) => void;
  onYear: (value: string) => void;
}

export function MonthYearFilter({ month, year, onMonth, onYear }: MonthYearFilterProps) {
  return (
    <Group gap="sm">
      <Select
        placeholder="Semua bulan"
        clearable
        data={MONTH_OPTIONS}
        value={month}
        onChange={onMonth}
        w={150}
        aria-label="Filter bulan"
      />
      <Select
        data={yearOptions()}
        value={year}
        onChange={(v) => v && onYear(v)}
        allowDeselect={false}
        w={110}
        aria-label="Filter tahun"
      />
    </Group>
  );
}
