// A nav item is active on its exact path, or on a deeper child path — except a
// child that is itself another nav item's exact route (e.g. /santri/perizinan/baru),
// so "Riwayat" (/santri/perizinan) doesn't light up on the "Buat Perizinan" page.
const SIBLING_LEAF_ROUTES = ["/santri/perizinan/baru"];

export function isNavItemActive(pathname: string, to: string): boolean {
  if (pathname === to) return true;
  if (SIBLING_LEAF_ROUTES.includes(pathname)) return pathname === to;
  return pathname.startsWith(`${to}/`);
}
