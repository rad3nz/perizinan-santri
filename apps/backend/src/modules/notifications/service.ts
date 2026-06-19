import type { Notify, PerizinanRow } from "../perizinan/service";
import { type NotificationDTO, toNotificationDTO } from "./dto";
import type { NewNotification, NotifRow } from "./repository";

export type ServerEvent =
  | { type: "connected"; unreadCount: number }
  | { type: "notification"; notification: NotificationDTO; unreadCount: number }
  | { type: "perizinan_changed" }
  | { type: "pong" };

type Owner = { id: number; kamarId: number | null };

interface NotifRepoPort {
  insertMany(rows: NewNotification[]): Promise<NotifRow[]>;
  countUnread(recipientId: number): Promise<number>;
}
interface UsersPort {
  findById(id: number): Promise<{ id: number; name: string; kamarId: number | null } | undefined>;
  findByRole(role: "mudir"): Promise<{ id: number }[]>;
  findMuaddibByKamar(kamarId: number): Promise<{ id: number } | undefined>;
}
interface WsPort {
  send(userId: number, event: ServerEvent): void;
}

export function createNotificationService(deps: {
  notifRepo: NotifRepoPort;
  usersRepo: UsersPort;
  ws: WsPort;
}): Notify {
  const { notifRepo, usersRepo, ws } = deps;

  const row = (
    recipientId: number,
    type: string,
    message: string,
    perizinanId: number | null,
  ): NewNotification => ({ recipientId, type, message, perizinanId });

  async function dispatch(rows: NewNotification[]) {
    if (rows.length === 0) return;
    const saved = await notifRepo.insertMany(rows); // persist first
    for (const n of saved) {
      ws.send(n.recipientId, {
        type: "notification",
        notification: toNotificationDTO(n),
        unreadCount: await notifRepo.countUnread(n.recipientId),
      });
    }
  }

  async function toMuaddib(
    p: PerizinanRow,
    owner: Owner,
    type: string,
    message: (name: string) => string,
  ) {
    if (owner.kamarId == null) return;
    const [santri, muaddib] = await Promise.all([
      usersRepo.findById(owner.id),
      usersRepo.findMuaddibByKamar(owner.kamarId),
    ]);
    if (!santri || !muaddib) return; // kamar without a muaddib -> no-op
    await dispatch([row(muaddib.id, type, message(santri.name), p.id)]);
  }

  return {
    async perizinanBaru(p, owner) {
      await toMuaddib(p, owner, "perizinan_baru", (name) => `${name} mengajukan perizinan baru.`);
    },
    async muaddibApproved(p, owner) {
      const mudirs = await usersRepo.findByRole("mudir");
      await dispatch([
        row(
          owner.id,
          "disetujui_muaddib",
          "Perizinan Anda disetujui Muaddib, menunggu Mudir.",
          p.id,
        ),
        ...mudirs.map((m) =>
          row(m.id, "disetujui_muaddib", "Ada perizinan menunggu persetujuan Mudir.", p.id),
        ),
      ]);
    },
    async muaddibRejected(p, owner) {
      await dispatch([
        row(owner.id, "ditolak_muaddib", "Perizinan Anda ditolak oleh Muaddib.", p.id),
      ]);
    },
    async mudirApproved(p, owner) {
      await dispatch([row(owner.id, "disetujui_mudir", "Perizinan Anda telah disetujui.", p.id)]);
    },
    async mudirRejected(p, owner) {
      await dispatch([row(owner.id, "ditolak_mudir", "Perizinan Anda ditolak oleh Mudir.", p.id)]);
    },
    async berangkat(p, owner) {
      await toMuaddib(p, owner, "berangkat", (name) => `${name} telah berangkat.`);
    },
    async kembali(p, owner) {
      await toMuaddib(p, owner, "kembali", (name) => `${name} telah kembali.`);
    },
  };
}
