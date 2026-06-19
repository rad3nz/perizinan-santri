import type { Role } from "@perizinan/shared";
import {
  ClipboardList,
  DoorOpen,
  FilePlus2,
  History,
  LayoutDashboard,
  type LucideIcon,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function navItemsFor(role: Role): NavItem[] {
  switch (role) {
    case "santri":
      return [
        { label: "Dashboard", to: "/santri/dashboard", icon: LayoutDashboard },
        { label: "Buat Perizinan", to: "/santri/perizinan/baru", icon: FilePlus2 },
        { label: "Riwayat", to: "/santri/perizinan", icon: History },
      ];
    case "muaddib":
      return [
        { label: "Dashboard", to: "/muaddib/dashboard", icon: LayoutDashboard },
        { label: "Daftar Perizinan", to: "/muaddib/perizinan", icon: ClipboardList },
      ];
    case "mudir":
      return [
        { label: "Dashboard", to: "/mudir/dashboard", icon: LayoutDashboard },
        { label: "Daftar Perizinan", to: "/mudir/perizinan", icon: ClipboardList },
      ];
    case "admin":
      return [
        { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Kamar", to: "/admin/kamar", icon: DoorOpen },
        { label: "Pengguna", to: "/admin/pengguna", icon: Users },
        { label: "Semua Perizinan", to: "/admin/perizinan", icon: ClipboardList },
      ];
  }
}
