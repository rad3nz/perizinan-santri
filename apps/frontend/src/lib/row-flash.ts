// Pure helper for the realtime row-flash. Given the previously-seen version of
// each row and the current rows, returns the keys whose version *changed* (it
// ignores first appearances — new rows use the entrance animation instead) plus
// the next version map to store for the following render.
export function computeChangedKeys<T, K, V>(
  prev: Map<K, V>,
  rows: T[],
  key: (row: T) => K,
  version: (row: T) => V,
): { changed: K[]; next: Map<K, V> } {
  const next = new Map<K, V>();
  const changed: K[] = [];
  for (const row of rows) {
    const k = key(row);
    const v = version(row);
    next.set(k, v);
    if (prev.has(k) && prev.get(k) !== v) changed.push(k);
  }
  return { changed, next };
}
