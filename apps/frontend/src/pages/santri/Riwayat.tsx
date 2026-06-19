import { Button, Paper, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerizinanList } from "../../api/hooks/usePerizinan";
import type { Perizinan } from "../../api/types";
import { ApprovalProgress } from "../../components/ApprovalProgress";
import { type Column, DataTable } from "../../components/DataTable";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { formatTanggal } from "../../lib/format";
import { jenisIzinLabel } from "../../lib/labels";

export function RiwayatPerizinan() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  const query = usePerizinanList({
    page,
    dateFrom: range[0] ?? undefined,
    dateTo: range[1] ?? undefined,
  });
  const payload = query.data?.data;

  const onRangeChange = (value: [string | null, string | null]) => {
    setRange(value);
    setPage(1);
  };

  const columns: Column<Perizinan>[] = [
    { header: "Jenis", render: (r) => jenisIzinLabel(r.jenisIzin) },
    { header: "Tujuan", render: (r) => r.tujuan },
    { header: "Keluar", render: (r) => formatTanggal(r.tanggalKeluar) },
    { header: "Persetujuan", render: (r) => <ApprovalProgress status={r.status} /> },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Stack>
      <PageHeader
        title="Riwayat Perizinan"
        description="Status perizinan Anda beserta persetujuan Muaddib dan Mudir."
        actions={
          <Button
            component={Link}
            to="/santri/perizinan/baru"
            color="brand"
            leftSection={<Plus size={16} strokeWidth={1.75} />}
          >
            Buat Perizinan
          </Button>
        }
      />
      <Paper withBorder radius="md" p="md">
        <Stack>
          <DatePickerInput
            type="range"
            clearable
            valueFormat="DD MMM YYYY"
            placeholder="Rentang tanggal keluar"
            value={range}
            onChange={onRangeChange}
            maw={320}
          />
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
      </Paper>
    </Stack>
  );
}
