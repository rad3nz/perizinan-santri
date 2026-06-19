import dayjs from "dayjs";

export const MONTH_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function yearOptions(now: Date = new Date()): { value: string; label: string }[] {
  const y = now.getFullYear();
  const years: number[] = [];
  for (let n = y - 5; n <= y + 5; n++) years.push(n);
  return years.map((n) => ({ value: String(n), label: String(n) }));
}

export function currentPeriod(now: Date = new Date()): { month: string; year: string } {
  return { month: String(now.getMonth() + 1), year: String(now.getFullYear()) };
}

// Inclusive [dateFrom, dateTo] in YYYY-MM-DD. month null ⇒ the whole year.
export function monthRange(
  year: string,
  month: string | null,
): { dateFrom: string; dateTo: string } {
  if (!month) {
    return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` };
  }
  const start = dayjs(`${year}-${month.padStart(2, "0")}-01`);
  return {
    dateFrom: start.format("YYYY-MM-DD"),
    dateTo: start.endOf("month").format("YYYY-MM-DD"),
  };
}
