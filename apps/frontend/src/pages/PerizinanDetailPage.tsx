import { Card, Center, Grid, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { useParams } from "react-router-dom";
import { usePerizinanDetail } from "../api/hooks/usePerizinan";
import { PerizinanActions } from "../components/PerizinanActions";
import { PerizinanTimeline } from "../components/PerizinanTimeline";
import { StatusBadge } from "../components/StatusBadge";
import { formatTanggal } from "../lib/format";
import { jenisIzinLabel } from "../lib/labels";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text>{value}</Text>
    </div>
  );
}

export function PerizinanDetailPage() {
  const { id } = useParams();
  const query = usePerizinanDetail(Number(id));
  const perizinan = query.data?.data;

  if (query.isLoading) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }
  if (!perizinan) {
    return (
      <Text c="dimmed" p="md">
        Perizinan tidak ditemukan.
      </Text>
    );
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Detail Perizinan</Title>
        <StatusBadge status={perizinan.status} />
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder padding="lg" radius="md">
            <Stack gap="md">
              <Group grow>
                <Field label="Santri" value={perizinan.santri.name} />
                <Field label="Kamar" value={perizinan.santri.kamar?.nama ?? "-"} />
              </Group>
              <Group grow>
                <Field label="Jenis Izin" value={jenisIzinLabel(perizinan.jenisIzin)} />
                <Field label="Tujuan" value={perizinan.tujuan} />
              </Group>
              <Group grow>
                <Field label="Tanggal Keluar" value={formatTanggal(perizinan.tanggalKeluar)} />
                <Field
                  label="Rencana Kembali"
                  value={formatTanggal(perizinan.tanggalKembaliRencana)}
                />
              </Group>
              {perizinan.catatan ? <Field label="Catatan" value={perizinan.catatan} /> : null}
              <PerizinanActions perizinan={perizinan} />
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="lg" radius="md">
            <Title order={4} mb="md">
              Riwayat Status
            </Title>
            <PerizinanTimeline perizinan={perizinan} />
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
