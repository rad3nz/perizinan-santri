import { Center, Group, Loader, Pagination, Table, Text } from "@mantine/core";
import type { ReactNode } from "react";

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
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader color="brand" />
      </Center>
    );
  }
  if (rows.length === 0) {
    return (
      <Text c="dimmed" py="md">
        {emptyText}
      </Text>
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
            {rows.map((row) => (
              <Table.Tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((c) => (
                  <Table.Td key={c.header}>{c.render(row)}</Table.Td>
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
