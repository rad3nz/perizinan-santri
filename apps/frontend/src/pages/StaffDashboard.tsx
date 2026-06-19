import { Center, Group, Loader, SimpleGrid, Stack, Title } from "@mantine/core";
import { CheckCircle2, Clock, Home, LogIn, LogOut, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { useDashboardStats } from "../api/hooks/useDashboard";
import type { StaffStats } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { PeriodToggle } from "../components/PeriodToggle";
import { StatCard } from "../components/StatCard";
import { type PeriodKind, periodRange } from "../lib/period";

export function StaffDashboard({ title = "Dashboard" }: { title?: string }) {
  const { role } = useAuth();
  const [period, setPeriod] = useState<PeriodKind>("month");
  const query = useDashboardStats(periodRange(period));
  const stats = query.data?.data as StaffStats | undefined;

  if (query.isLoading || !stats) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }

  const showSantriDiAsrama = role === "muaddib" || role === "mudir";

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        <PeriodToggle value={period} onChange={setPeriod} />
      </Group>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        <StatCard label="Total Santri" value={stats.totalSantri} icon={Users} />
        {showSantriDiAsrama ? (
          <StatCard
            label="Santri di Asrama"
            value={stats.santriDiAsrama}
            color="teal"
            icon={Home}
          />
        ) : null}
        <StatCard
          label="Menunggu Muaddib"
          value={stats.menungguMuaddib}
          color="yellow"
          icon={Clock}
        />
        <StatCard
          label="Menunggu Mudir"
          value={stats.menungguMudir}
          color="yellow"
          icon={UserCheck}
        />
        <StatCard label="Disetujui" value={stats.disetujui} color="green" icon={CheckCircle2} />
        <StatCard label="Berangkat" value={stats.berangkat} color="blue" icon={LogOut} />
        <StatCard label="Kembali Hari Ini" value={stats.kembaliHariIni} color="gray" icon={LogIn} />
      </SimpleGrid>
    </Stack>
  );
}
