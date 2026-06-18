export function pageParams(q: { page?: number; limit?: number }): { page: number; limit: number } {
  const page = q.page && q.page > 0 ? Math.floor(q.page) : 1;
  const limit = q.limit && q.limit > 0 ? Math.min(Math.floor(q.limit), 100) : 10;
  return { page, limit };
}
