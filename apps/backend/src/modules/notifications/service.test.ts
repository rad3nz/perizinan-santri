import { beforeEach, expect, test } from "bun:test";
import type { PerizinanRow } from "../perizinan/service";
import type { NewNotification, NotifRow } from "./repository";
import { createNotificationService } from "./service";

type Owner = { id: number; kamarId: number | null };
const p = { id: 500 } as unknown as PerizinanRow; // triggers only read p.id
const ownerKamar1: Owner = { id: 1, kamarId: 1 };
const ownerKamar3: Owner = { id: 1, kamarId: 3 }; // kamar 3 has no muaddib

let inserted: NewNotification[];
let sends: Array<{ userId: number; event: unknown }>;

const notifRepo = {
  async insertMany(rows: NewNotification[]): Promise<NotifRow[]> {
    inserted.push(...rows);
    return rows.map((r, i) => ({
      ...r,
      id: i + 1,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  },
  async countUnread() {
    return 0;
  },
};
const usersRepo = {
  async findById(id: number) {
    return { id, name: "Budi", kamarId: 1 };
  },
  async findByRole() {
    return [{ id: 201 }, { id: 202 }];
  },
  async findMuaddibByKamar(kamarId: number) {
    return kamarId === 1 ? { id: 101 } : undefined;
  },
};
const ws = {
  send(userId: number, event: unknown) {
    sends.push({ userId, event });
  },
};

const notify = createNotificationService({ notifRepo, usersRepo, ws });

beforeEach(() => {
  inserted = [];
  sends = [];
});

test("muaddibApproved notifies the santri + all mudir (one row each)", async () => {
  await notify.muaddibApproved(p, ownerKamar1);
  expect(inserted).toHaveLength(3);
  expect(inserted.map((r) => r.recipientId).sort((a, b) => a - b)).toEqual([1, 201, 202]);
  expect(inserted.every((r) => r.type === "disetujui_muaddib")).toBe(true);
  expect(sends).toHaveLength(3);
});

test("muaddibRejected notifies only the santri", async () => {
  await notify.muaddibRejected(p, ownerKamar1);
  expect(inserted).toHaveLength(1);
  expect(inserted[0].recipientId).toBe(1);
  expect(inserted[0].type).toBe("ditolak_muaddib");
});

test("berangkat notifies only the kamar muaddib, not the mudir", async () => {
  await notify.berangkat(p, ownerKamar1);
  expect(inserted).toHaveLength(1);
  expect(inserted[0].recipientId).toBe(101);
  expect(inserted[0].type).toBe("berangkat");
});

test("berangkat for a kamar with no muaddib inserts nothing and does not throw", async () => {
  await notify.berangkat(p, ownerKamar3);
  expect(inserted).toHaveLength(0);
  expect(sends).toHaveLength(0);
});
