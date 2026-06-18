import { Avatar, Group, Menu, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../auth/auth-store";
import { useAuth } from "../auth/useAuth";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const { user } = useAuth();
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const logout = async () => {
    await api.api.auth.logout.post();
    clear();
    navigate("/login", { replace: true });
  };

  return (
    <Group gap="md">
      <NotificationBell />
      <Menu position="bottom-end" withArrow>
        <Menu.Target>
          <Group gap="xs" style={{ cursor: "pointer" }}>
            <Avatar color="gold" radius="xl" size="sm">
              {user?.name?.[0] ?? "?"}
            </Avatar>
            <Text size="sm" c="white">
              {user?.name}
            </Text>
          </Group>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => navigate("/profil")}>Profil</Menu.Item>
          <Menu.Item color="red" onClick={logout}>
            Keluar
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
