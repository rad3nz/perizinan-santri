import { Group, ThemeIcon, Tooltip } from "@mantine/core";
import type { PerizinanStatus } from "@perizinan/shared";
import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { type ApprovalLevel, approvalState } from "../lib/labels";

const LEVEL_META: Record<
  ApprovalLevel,
  { Icon: typeof CheckCircle2; color: string; label: string }
> = {
  approved: { Icon: CheckCircle2, color: "green", label: "Disetujui" },
  rejected: { Icon: XCircle, color: "red", label: "Ditolak" },
  pending: { Icon: Clock, color: "yellow", label: "Menunggu" },
  none: { Icon: MinusCircle, color: "gray", label: "Belum diproses" },
};

export function ApprovalLevelIcon({ level, who }: { level: ApprovalLevel; who?: string }) {
  const { Icon, color, label } = LEVEL_META[level];
  return (
    <Tooltip label={who ? `${who}: ${label}` : label} withArrow>
      <ThemeIcon variant="light" color={color} size="sm" radius="xl">
        <Icon size={16} strokeWidth={1.75} />
      </ThemeIcon>
    </Tooltip>
  );
}

export function ApprovalProgress({ status }: { status: PerizinanStatus }) {
  const s = approvalState(status);
  return (
    <Group gap={6} wrap="nowrap">
      <ApprovalLevelIcon level={s.muaddib} who="Muaddib" />
      <ApprovalLevelIcon level={s.mudir} who="Mudir" />
    </Group>
  );
}
