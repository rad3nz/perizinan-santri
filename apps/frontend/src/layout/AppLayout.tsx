import { AppShell, Burger, Group, NavLink, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, NavLink as RouterNavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { navItemsFor } from "../lib/nav";
import { useNotificationSocket } from "../lib/ws";
import { Header } from "./Header";

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useAuth();
  useNotificationSocket();
  const navItems = user ? navItemsFor(user.role) : [];

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" bg="navy.8" c="white">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <Title order={4}>Perizinan Santri</Title>
          </Group>
          <Header />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink key={item.to} component={RouterNavLink} to={item.to} label={item.label} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
