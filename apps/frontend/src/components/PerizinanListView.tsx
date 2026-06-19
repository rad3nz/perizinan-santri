import { Group, Paper, Select, Stack } from "@mantine/core";
import {
  JENIS_IZIN,
  type JenisIzin,
  PERIZINAN_STATUS,
  type PerizinanStatus,
} from "@perizinan/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKamarList } from "../api/hooks/useKamar";
import { usePerizinanList } from "../api/hooks/usePerizinan";
import type { Perizinan } from "../api/types";
import { formatTanggal } from "../lib/format";
import { jenisIzinLabel, statusLabel } from "../lib/labels";
import { currentPeriod, monthRange } from "../lib/period";
import { type Column, DataTable } from "./DataTable";
import { MonthYearFilter } from "./MonthYearFilter";
import { PageHeader } from "./PageHeader";
import { PerizinanRowActions } from "./PerizinanRowActions";
import { StatusBadge } from "./StatusBadge";

interface PerizinanListViewProps {
  title: string;
  basePath: string;
  showKamarFilter?: boolean;
  showJenisFilter?: boolean;
  showActions?: boolean;
  showKamar?: boolean;
}

export function PerizinanListView({
  title,
  basePath,
  showKamarFilter,
  showJenisFilter,
  showActions,
  showKamar,
}: PerizinanListViewProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [kamarId, setKamarId] = useState<string | null>(null);
  const [jenisIzin, setJenisIzin] = useState<string | null>(null);
  const [period, setPeriod] = useState<{ month: string | null; year: string }>(currentPeriod);

  const kamarQuery = useKamarList();
  const kamarOptions =
    kamarQuery.data?.data.items.map((k) => ({ value: String(k.id), label: k.nama })) ?? [];

  const { dateFrom, dateTo } = monthRange(period.year, period.month);
  const query = usePerizinanList({
    page,
    status: (status as PerizinanStatus | null) ?? undefined,
    kamarId: kamarId ? Number(kamarId) : undefined,
    jenisIzin: (jenisIzin as JenisIzin | null) ?? undefined,
    dateFrom,
    dateTo,
  });
  const payload = query.data?.data;

  const columns: Column<Perizinan>[] = [
    { header: "Santri", render: (r) => r.santri.name },
    ...(showKamar
      ? [{ header: "Kamar", render: (r: Perizinan) => r.santri.kamar?.nama ?? "-" }]
      : []),
    { header: "Jenis", render: (r) => jenisIzinLabel(r.jenisIzin) },
    { header: "Tujuan", render: (r) => r.tujuan },
    { header: "Keluar", render: (r) => formatTanggal(r.tanggalKeluar) },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (showActions) {
    columns.push({ header: "Aksi", render: (r) => <PerizinanRowActions perizinan={r} /> });
  }

  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };
  const setMonth = (month: string | null) => {
    setPeriod((p) => ({ ...p, month }));
    setPage(1);
  };
  const setYear = (year: string) => {
    setPeriod((p) => ({ ...p, year }));
    setPage(1);
  };

  return (
    <Stack>
      <PageHeader title={title} description="Kelola dan tinjau perizinan santri." />
      <Paper withBorder radius="md" p="md">
        <Stack>
          <Group>
            <Select
              placeholder="Semua status"
              clearable
              data={PERIZINAN_STATUS.map((s) => ({ value: s, label: statusLabel(s) }))}
              value={status}
              onChange={resetPage(setStatus)}
            />
            <MonthYearFilter
              month={period.month}
              year={period.year}
              onMonth={setMonth}
              onYear={setYear}
            />
            {showKamarFilter ? (
              <Select
                placeholder="Semua kamar"
                clearable
                data={kamarOptions}
                value={kamarId}
                onChange={resetPage(setKamarId)}
              />
            ) : null}
            {showJenisFilter ? (
              <Select
                placeholder="Semua jenis"
                clearable
                data={JENIS_IZIN.map((j) => ({ value: j, label: jenisIzinLabel(j) }))}
                value={jenisIzin}
                onChange={resetPage(setJenisIzin)}
              />
            ) : null}
          </Group>
          <DataTable
            columns={columns}
            rows={payload?.items ?? []}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`${basePath}/${r.id}`)}
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
