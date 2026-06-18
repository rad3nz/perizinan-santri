import { Badge } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { statusLabel, statusTone } from "../lib/labels";

export function StatusBadge({ status }: { status: PerizinanStatus }) {
  return (
    <Badge color={statusTone(status)} variant="light">
      {statusLabel(status)}
    </Badge>
  );
}
