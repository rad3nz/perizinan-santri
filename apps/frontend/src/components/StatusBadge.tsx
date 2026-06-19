import { Badge } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { statusLabel, statusTone } from "../lib/labels";

export function StatusBadge({ status }: { status: PerizinanStatus }) {
  const tone = statusTone(status);
  return (
    <Badge
      color={tone}
      variant="light"
      leftSection={
        <span
          style={{
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: `var(--mantine-color-${tone}-6)`,
          }}
        />
      }
    >
      {statusLabel(status)}
    </Badge>
  );
}
