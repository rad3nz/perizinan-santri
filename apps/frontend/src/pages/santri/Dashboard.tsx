import { Center, Loader, SimpleGrid, Stack, Title } from "@mantine/core";
import { CheckCircle2, ClipboardList, Clock, LogOut, XCircle } from "lucide-react";
import { useDashboardStats } from "../../api/hooks/useDashboard";
import type { SantriStats } from "../../api/types";
import { StatCard } from "../../components/StatCard";

export function SantriDashboard() {
  const query = useDashboardStats();
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
      <Title order={2}>Dashboard</Title>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        <StatCard label="Total Perizinan" value={stats.totalPerizinan} icon={ClipboardList} />
        <StatCard label="Menunggu" value={stats.menunggu} color="yellow" icon={Clock} />
        <StatCard label="Disetujui" value={stats.disetujui} color="green" icon={CheckCircle2} />
        <StatCard label="Berangkat" value={stats.berangkat} color="blue" icon={LogOut} />
        <StatCard label="Ditolak" value={stats.ditolak} color="red" icon={XCircle} />
      </SimpleGrid>
    </Stack>
  );
}
