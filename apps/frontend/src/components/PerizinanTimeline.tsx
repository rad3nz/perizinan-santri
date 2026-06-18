import { Text, Timeline } from "@mantine/core";
import type { Perizinan } from "../api/types";
import { formatTanggal } from "../lib/format";

export function PerizinanTimeline({ perizinan }: { perizinan: Perizinan }) {
  const items: { title: string; detail: string | null; at: string | null }[] = [
    { title: "Diajukan", detail: null, at: perizinan.createdAt },
  ];

  if (perizinan.muaddibAt) {
    const rejected = perizinan.status === "ditolak_muaddib";
    items.push({
      title: rejected ? "Ditolak Muaddib" : "Disetujui Muaddib",
      detail: rejected ? perizinan.alasanPenolakan : perizinan.muaddibCatatan,
      at: perizinan.muaddibAt,
    });
  }
  if (perizinan.mudirAt) {
    const rejected = perizinan.status === "ditolak_mudir";
    items.push({
      title: rejected ? "Ditolak Mudir" : "Disetujui Mudir",
      detail: rejected ? perizinan.alasanPenolakan : perizinan.mudirCatatan,
      at: perizinan.mudirAt,
    });
  }
  if (perizinan.tanggalKembaliAktual) {
    items.push({ title: "Kembali", detail: null, at: perizinan.tanggalKembaliAktual });
  }

  return (
    <Timeline active={items.length - 1} bulletSize={18} lineWidth={2}>
      {items.map((item) => (
        <Timeline.Item key={item.title} title={item.title}>
          {item.detail ? (
            <Text size="sm" c="dimmed">
              {item.detail}
            </Text>
          ) : null}
          {item.at ? (
            <Text size="xs" c="dimmed" mt={2}>
              {formatTanggal(item.at)}
            </Text>
          ) : null}
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
