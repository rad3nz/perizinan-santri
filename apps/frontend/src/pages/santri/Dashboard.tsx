import { Center, Loader, SimpleGrid, Stack, Title } from "@mantine/core";
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
        <StatCard label="Total Perizinan" value={stats.totalPerizinan} />
        <StatCard label="Menunggu" value={stats.menunggu} color="yellow" />
        <StatCard label="Disetujui" value={stats.disetujui} color="green" />
        <StatCard label="Berangkat" value={stats.berangkat} color="blue" />
        <StatCard label="Ditolak" value={stats.ditolak} color="red" />
      </SimpleGrid>
    </Stack>
  );
}
