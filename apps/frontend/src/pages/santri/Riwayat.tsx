import { Button, Paper, Stack } from "@mantine/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerizinanList } from "../../api/hooks/usePerizinan";
import type { Perizinan } from "../../api/types";
import { ApprovalLevelIcon } from "../../components/ApprovalProgress";
import { type Column, DataTable } from "../../components/DataTable";
import { MonthYearFilter } from "../../components/MonthYearFilter";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { durationHari, formatTanggal } from "../../lib/format";
import { approvalState, jenisIzinLabel } from "../../lib/labels";
import { currentPeriod, monthRange } from "../../lib/period";

export function RiwayatPerizinan() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<{ month: string | null; year: string }>(currentPeriod);
  const { dateFrom, dateTo } = monthRange(period.year, period.month);
  const query = usePerizinanList({ page, dateFrom, dateTo });
  const payload = query.data?.data;

  const setMonth = (month: string | null) => {
    setPeriod((p) => ({ ...p, month }));
    setPage(1);
  };
  const setYear = (year: string) => {
    setPeriod((p) => ({ ...p, year }));
    setPage(1);
  };

  const columns: Column<Perizinan>[] = [
    { header: "Jenis", render: (r) => jenisIzinLabel(r.jenisIzin) },
    { header: "Tujuan", render: (r) => r.tujuan },
    { header: "Keluar", render: (r) => formatTanggal(r.tanggalKeluar) },
    { header: "Rencana Kembali", render: (r) => formatTanggal(r.tanggalKembaliRencana) },
    {
      header: "Lama",
      render: (r) => `${durationHari(r.tanggalKeluar, r.tanggalKembaliRencana)} hari`,
    },
    {
      header: "Muaddib",
      render: (r) => <ApprovalLevelIcon level={approvalState(r.status).muaddib} who="Muaddib" />,
    },
    {
      header: "Mudir",
      render: (r) => <ApprovalLevelIcon level={approvalState(r.status).mudir} who="Mudir" />,
    },
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
          <MonthYearFilter
            month={period.month}
            year={period.year}
            onMonth={setMonth}
            onYear={setYear}
          />
          <DataTable
            columns={columns}
            rows={payload?.items ?? []}
            rowKey={(r) => r.id}
            rowVersion={(r) => r.updatedAt}
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
