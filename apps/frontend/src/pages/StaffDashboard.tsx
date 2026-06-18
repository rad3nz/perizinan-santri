import { Center, Loader, SimpleGrid, Stack, Title } from "@mantine/core";
import { useDashboardStats } from "../api/hooks/useDashboard";
import type { StaffStats } from "../api/types";
import { StatCard } from "../components/StatCard";

export function StaffDashboard({ title = "Dashboard" }: { title?: string }) {
  const query = useDashboardStats();
  const stats = query.data?.data as StaffStats | undefined;

  if (query.isLoading || !stats) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }

  return (
    <Stack>
      <Title order={2}>{title}</Title>
      <SimpleGrid cols={{ base: 2, sm: 3 }}>
        <StatCard label="Total Santri" value={stats.totalSantri} />
        <StatCard label="Menunggu Muaddib" value={stats.menungguMuaddib} color="yellow" />
        <StatCard label="Menunggu Mudir" value={stats.menungguMudir} color="yellow" />
        <StatCard label="Disetujui" value={stats.disetujui} color="green" />
        <StatCard label="Berangkat" value={stats.berangkat} color="blue" />
        <StatCard label="Kembali Hari Ini" value={stats.kembaliHariIni} color="gray" />
      </SimpleGrid>
    </Stack>
  );
}
