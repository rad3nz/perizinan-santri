import { ActionIcon, Button, Group, Indicator, Menu, ScrollArea, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMarkAllRead, useMarkRead, useNotificationsList } from "../api/hooks/useNotifications";
import type { NotificationItem } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { formatTanggal } from "../lib/format";
import { useNotifStore } from "../lib/notif-store";

export function NotificationBell() {
  const { user } = useAuth();
  const unreadCount = useNotifStore((s) => s.unreadCount);
  const setUnread = useNotifStore((s) => s.setUnread);
  const navigate = useNavigate();
  const list = useNotificationsList({ limit: 10 });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const items = list.data?.data.items ?? [];

  const openItem = (item: NotificationItem) => {
    if (!item.isRead) {
      markRead.mutate(item.id);
      setUnread(Math.max(0, unreadCount - 1));
    }
    if (item.perizinanId && user) navigate(`/${user.role}/perizinan/${item.perizinanId}`);
  };

  const readAll = () => markAllRead.mutate(undefined, { onSuccess: () => setUnread(0) });

  return (
    <Menu position="bottom-end" withArrow width={320}>
      <Menu.Target>
        <Indicator label={unreadCount} size={16} color="red" disabled={unreadCount === 0}>
          <ActionIcon variant="subtle" color="gray" aria-label="Notifikasi">
            🔔
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      <Menu.Dropdown>
        <Group justify="space-between" px="sm" py="xs">
          <Text fw={600} size="sm">
            Notifikasi
          </Text>
          <Button variant="subtle" size="compact-xs" onClick={readAll}>
            Tandai semua dibaca
          </Button>
        </Group>
        <ScrollArea.Autosize mah={320}>
          {items.length === 0 ? (
            <Text c="dimmed" size="sm" px="sm" py="md">
              Belum ada notifikasi.
            </Text>
          ) : (
            items.map((item) => (
              <Menu.Item key={item.id} onClick={() => openItem(item)}>
                <Text size="sm" fw={item.isRead ? 400 : 600}>
                  {item.message}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatTanggal(item.createdAt)}
                </Text>
              </Menu.Item>
            ))
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
