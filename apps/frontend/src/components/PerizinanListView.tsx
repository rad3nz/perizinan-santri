import { Group, Select, Stack, Title } from "@mantine/core";
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
import { type Column, DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";

interface PerizinanListViewProps {
  title: string;
  basePath: string;
  showKamarFilter?: boolean;
  showJenisFilter?: boolean;
}

export function PerizinanListView({
  title,
  basePath,
  showKamarFilter,
  showJenisFilter,
}: PerizinanListViewProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [kamarId, setKamarId] = useState<string | null>(null);
  const [jenisIzin, setJenisIzin] = useState<string | null>(null);

  const kamarQuery = useKamarList();
  const kamarOptions =
    kamarQuery.data?.data.items.map((k) => ({ value: String(k.id), label: k.nama })) ?? [];

  const query = usePerizinanList({
    page,
    status: (status as PerizinanStatus | null) ?? undefined,
    kamarId: kamarId ? Number(kamarId) : undefined,
    jenisIzin: (jenisIzin as JenisIzin | null) ?? undefined,
  });
  const payload = query.data?.data;

  const columns: Column<Perizinan>[] = [
    { header: "Santri", render: (r) => r.santri.name },
    { header: "Jenis", render: (r) => jenisIzinLabel(r.jenisIzin) },
    { header: "Tujuan", render: (r) => r.tujuan },
    { header: "Keluar", render: (r) => formatTanggal(r.tanggalKeluar) },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const resetPage =
    <T,>(setter: (v: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  return (
    <Stack>
      <Title order={2}>{title}</Title>
      <Group>
        <Select
          placeholder="Semua status"
          clearable
          data={PERIZINAN_STATUS.map((s) => ({ value: s, label: statusLabel(s) }))}
          value={status}
          onChange={resetPage(setStatus)}
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
  );
}
