import { AppShell, Burger, Group, NavLink, ThemeIcon, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { GraduationCap } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { RouteTransition } from "../components/RouteTransition";
import { navItemsFor } from "../lib/nav";
import { isNavItemActive } from "../lib/nav-active";
import { useNotificationSocket } from "../lib/ws";
import { Header } from "./Header";

export function AppLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { user } = useAuth();
  const location = useLocation();
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
            <ThemeIcon variant="white" color="navy" size="md" radius="md">
              <GraduationCap size={18} strokeWidth={1.75} />
            </ThemeIcon>
            <Title order={4}>Perizinan Santri</Title>
          </Group>
          <Header />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              active={isNavItemActive(location.pathname, item.to)}
              leftSection={<Icon size={18} strokeWidth={1.75} />}
            />
          );
        })}
      </AppShell.Navbar>
      <AppShell.Main>
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </AppShell.Main>
    </AppShell>
  );
}
