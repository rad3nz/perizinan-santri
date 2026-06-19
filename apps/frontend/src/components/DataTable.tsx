import { Center, Group, Loader, Pagination, Stack, Table, Text } from "@mantine/core";
import { Inbox } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { computeChangedKeys } from "../lib/row-flash";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyText?: string;
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  // When provided, a row briefly highlights whenever its version changes
  // (e.g. a realtime status update). Use a value that changes on every mutation.
  rowVersion?: (row: T) => string | number;
}

type Key = string | number;

// Tracks which row keys changed version since the last render and keeps them
// "flashing" for the duration of the highlight animation. Depends only on `rows`
// (a stable ref from React Query until a refetch) so the clear-timeout survives.
function useRowFlash<T>(
  rows: T[],
  rowKey: (row: T) => Key,
  rowVersion?: (row: T) => Key,
): Set<Key> {
  const prev = useRef(new Map<Key, Key>());
  const keyRef = useRef(rowKey);
  keyRef.current = rowKey;
  const verRef = useRef(rowVersion);
  verRef.current = rowVersion;
  const [flashing, setFlashing] = useState<Set<Key>>(new Set());

  useEffect(() => {
    const version = verRef.current;
    if (!version) return;
    const { changed, next } = computeChangedKeys(prev.current, rows, keyRef.current, version);
    prev.current = next;
    if (changed.length === 0) return;
    setFlashing((s) => new Set([...s, ...changed]));
    const timer = setTimeout(() => {
      setFlashing((s) => {
        const n = new Set(s);
        for (const k of changed) n.delete(k);
        return n;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [rows]);

  return flashing;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  emptyText = "Belum ada data.",
  page,
  total,
  limit,
  onPageChange,
  rowVersion,
}: DataTableProps<T>) {
  const flashing = useRowFlash(rows, rowKey, rowVersion);

  if (loading) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }
  if (rows.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <Inbox size={28} strokeWidth={1.5} color="var(--mantine-color-dimmed)" />
          <Text c="dimmed" size="sm">
            {emptyText}
          </Text>
        </Stack>
      </Center>
    );
  }

  const totalPages =
    total != null && limit != null && limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 0;

  return (
    <>
      <Table.ScrollContainer minWidth={500}>
        <Table highlightOnHover={Boolean(onRowClick)} striped>
          <Table.Thead>
            <Table.Tr>
              {columns.map((c) => (
                <Table.Th key={c.header}>{c.header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row, i) => (
              <Table.Tr
                key={rowKey(row)}
                className={flashing.has(rowKey(row)) ? "motion-row-flash" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((c) => (
                  <Table.Td
                    key={c.header}
                    className="motion-row-enter"
                    style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                  >
                    {c.render(row)}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {totalPages > 1 && page != null && onPageChange ? (
        <Group justify="flex-end" mt="md">
          <Pagination value={page} total={totalPages} onChange={onPageChange} color="brand" />
        </Group>
      ) : null}
    </>
  );
}
