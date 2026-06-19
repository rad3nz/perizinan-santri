type Socket = { send: (data: string) => void };

const registry = new Map<number, Set<Socket>>();

export const wsRegistry = {
  add(userId: number, ws: Socket) {
    const set = registry.get(userId) ?? new Set<Socket>();
    set.add(ws);
    registry.set(userId, set);
  },
  remove(userId: number, ws: Socket) {
    const set = registry.get(userId);
    set?.delete(ws);
    if (set && set.size === 0) registry.delete(userId);
  },
  send(userId: number, event: unknown) {
    const set = registry.get(userId);
    if (!set) return; // offline -> row already persisted, seen on next fetch/connect
    const payload = JSON.stringify(event);
    for (const ws of set) ws.send(payload);
  },
  sendMany(userIds: number[], event: unknown) {
    for (const id of new Set(userIds)) this.send(id, event);
  },
  broadcast(event: unknown) {
    const payload = JSON.stringify(event);
    for (const set of registry.values()) {
      for (const ws of set) ws.send(payload);
    }
  },
};
