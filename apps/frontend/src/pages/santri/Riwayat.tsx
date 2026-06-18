import { Button, Group, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerizinanList } from "../../api/hooks/usePerizinan";
import type { Perizinan } from "../../api/types";
import { type Column, DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { formatTanggal } from "../../lib/format";
import { jenisIzinLabel } from "../../lib/labels";

export function RiwayatPerizinan() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const query = usePerizinanList({ page });
  const payload = query.data?.data;

  const columns: Column<Perizinan>[] = [
    { header: "Jenis", render: (r) => jenisIzinLabel(r.jenisIzin) },
    { header: "Tujuan", render: (r) => r.tujuan },
    { header: "Keluar", render: (r) => formatTanggal(r.tanggalKeluar) },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Riwayat Perizinan</Title>
        <Button component={Link} to="/santri/perizinan/baru" color="brand">
          Buat Perizinan
        </Button>
      </Group>
      <DataTable
        columns={columns}
        rows={payload?.items ?? []}
        rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/santri/perizinan/${r.id}`)}
        loading={query.isLoading}
        page={page}
        total={payload?.total}
        limit={payload?.limit}
        onPageChange={setPage}
      />
    </Stack>
  );
}
