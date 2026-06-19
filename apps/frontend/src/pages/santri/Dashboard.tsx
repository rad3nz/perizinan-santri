import { Center, Group, Loader, SimpleGrid, Stack, Title } from "@mantine/core";
import { CheckCircle2, ClipboardList, Clock, LogOut, XCircle } from "lucide-react";
import { useState } from "react";
import { useDashboardStats } from "../../api/hooks/useDashboard";
import type { SantriStats } from "../../api/types";
import { PeriodToggle } from "../../components/PeriodToggle";
import { StatCard } from "../../components/StatCard";
import { PERIOD_LABEL, type PeriodKind, periodRange } from "../../lib/period";

export function SantriDashboard() {
  const [period, setPeriod] = useState<PeriodKind>("month");
  const query = useDashboardStats(periodRange(period));
  const stats = query.data?.data as SantriStats | undefined;

  if (query.isLoading || !stats) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Dashboard</Title>
        <PeriodToggle value={period} onChange={setPeriod} />
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        <StatCard
          label="Total Perizinan"
          value={stats.totalPerizinan}
          icon={ClipboardList}
          hint={PERIOD_LABEL[period]}
        />
        <StatCard label="Menunggu" value={stats.menunggu} color="yellow" icon={Clock} />
        <StatCard
          label="Disetujui"
          value={stats.disetujui}
          color="green"
          icon={CheckCircle2}
          hint={PERIOD_LABEL[period]}
        />
        <StatCard label="Berangkat" value={stats.berangkat} color="blue" icon={LogOut} />
        <StatCard
          label="Ditolak"
          value={stats.ditolak}
          color="red"
          icon={XCircle}
          hint={PERIOD_LABEL[period]}
        />
      </SimpleGrid>
    </Stack>
  );
}
