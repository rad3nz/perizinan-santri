import type { Role } from "@perizinan/shared";

export interface NavItem {
  label: string;
  to: string;
}

export function navItemsFor(role: Role): NavItem[] {
  switch (role) {
    case "santri":
      return [
        { label: "Dashboard", to: "/santri/dashboard" },
        { label: "Buat Perizinan", to: "/santri/perizinan/baru" },
        { label: "Riwayat", to: "/santri/perizinan" },
      ];
    case "muaddib":
      return [
        { label: "Dashboard", to: "/muaddib/dashboard" },
        { label: "Daftar Perizinan", to: "/muaddib/perizinan" },
      ];
    case "mudir":
      return [
        { label: "Dashboard", to: "/mudir/dashboard" },
        { label: "Daftar Perizinan", to: "/mudir/perizinan" },
      ];
    case "admin":
      return [
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Kamar", to: "/admin/kamar" },
        { label: "Pengguna", to: "/admin/pengguna" },
        { label: "Semua Perizinan", to: "/admin/perizinan" },
      ];
  }
}
