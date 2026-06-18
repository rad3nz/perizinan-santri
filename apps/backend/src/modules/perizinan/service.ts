import type { JenisIzin } from "@perizinan/shared";
import type { perizinan } from "../../db/schema";
import { NotFoundError, ValidationError } from "../../lib/errors";
import {
  type Actor,
  assertOwner,
  assertSameKamar,
  assertTransition,
  requireAlasan,
} from "./guards";

export type PerizinanRow = typeof perizinan.$inferSelect;
type NewPerizinan = typeof perizinan.$inferInsert;

export type SubmitInput = {
  jenisIzin: JenisIzin;
  tujuan: string;
  tanggalKeluar: string;
  tanggalKembaliRencana: string;
  catatan?: string | null;
};

export interface PerizinanRepoPort {
  findById(id: number): Promise<PerizinanRow | undefined>;
  create(values: NewPerizinan): Promise<PerizinanRow>;
  update(id: number, patch: Partial<PerizinanRow>): Promise<PerizinanRow>;
}

export interface UsersPort {
  findById(id: number): Promise<{ id: number; role: string; kamarId: number | null } | undefined>;
}

type Owner = { id: number; kamarId: number | null };

export interface Notify {
  perizinanBaru(p: PerizinanRow, owner: Owner): Promise<void>;
  muaddibApproved(p: PerizinanRow, owner: Owner): Promise<void>;
  muaddibRejected(p: PerizinanRow, owner: Owner): Promise<void>;
  mudirApproved(p: PerizinanRow, owner: Owner): Promise<void>;
  mudirRejected(p: PerizinanRow, owner: Owner): Promise<void>;
  berangkat(p: PerizinanRow, owner: Owner): Promise<void>;
  kembali(p: PerizinanRow, owner: Owner): Promise<void>;
}

export const noopNotify: Notify = {
  async perizinanBaru() {},
  async muaddibApproved() {},
  async muaddibRejected() {},
  async mudirApproved() {},
  async mudirRejected() {},
  async berangkat() {},
  async kembali() {},
};

export class PerizinanService {
  constructor(
    private repo: PerizinanRepoPort,
    private users: UsersPort,
    private notify: Notify,
  ) {}

  private async load(id: number): Promise<PerizinanRow> {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundError();
    return p;
  }

  private async owner(p: PerizinanRow): Promise<Owner> {
    const o = await this.users.findById(p.userId);
    if (!o) throw new NotFoundError();
    return { id: o.id, kamarId: o.kamarId };
  }

  async submit(actor: Actor, input: SubmitInput): Promise<PerizinanRow> {
    if (input.tanggalKembaliRencana < input.tanggalKeluar) {
      throw new ValidationError("Tanggal kembali harus setelah tanggal keluar.", {
        tanggalKembaliRencana: ["Tanggal kembali harus setelah tanggal keluar."],
      });
    }
    const created = await this.repo.create({
      userId: actor.id,
      jenisIzin: input.jenisIzin,
      tujuan: input.tujuan,
      tanggalKeluar: new Date(input.tanggalKeluar),
      tanggalKembaliRencana: new Date(input.tanggalKembaliRencana),
      catatan: input.catatan ?? null,
      status: "menunggu_muaddib",
    });
    await this.notify.perizinanBaru(created, { id: actor.id, kamarId: actor.kamarId });
    return created;
  }

  async edit(id: number, actor: Actor, input: SubmitInput): Promise<PerizinanRow> {
    const p = await this.load(id);
    assertOwner(actor, p);
    assertTransition(p, "menunggu_muaddib");
    return this.repo.update(id, {
      jenisIzin: input.jenisIzin,
      tujuan: input.tujuan,
      tanggalKeluar: new Date(input.tanggalKeluar),
      tanggalKembaliRencana: new Date(input.tanggalKembaliRencana),
      catatan: input.catatan ?? null,
    });
  }

  async approveMuaddib(id: number, actor: Actor, catatan?: string): Promise<PerizinanRow> {
    const p = await this.load(id);
    const owner = await this.owner(p);
    assertTransition(p, "menunggu_muaddib");
    assertSameKamar(actor, owner.kamarId);
    const updated = await this.repo.update(id, {
      status: "menunggu_mudir",
      muaddibId: actor.id,
      muaddibAt: new Date(),
      muaddibCatatan: catatan ?? null,
    });
    await this.notify.muaddibApproved(updated, owner);
    return updated;
  }

  async rejectMuaddib(id: number, actor: Actor, alasanPenolakan?: string): Promise<PerizinanRow> {
    const p = await this.load(id);
    const owner = await this.owner(p);
    assertTransition(p, "menunggu_muaddib");
    assertSameKamar(actor, owner.kamarId);
    requireAlasan(alasanPenolakan);
    const updated = await this.repo.update(id, {
      status: "ditolak_muaddib",
      muaddibId: actor.id,
      muaddibAt: new Date(),
      alasanPenolakan,
    });
    await this.notify.muaddibRejected(updated, owner);
    return updated;
  }

  async approveMudir(id: number, actor: Actor, catatan?: string): Promise<PerizinanRow> {
    const p = await this.load(id);
    const owner = await this.owner(p);
    assertTransition(p, "menunggu_mudir");
    const updated = await this.repo.update(id, {
      status: "disetujui",
      mudirId: actor.id,
      mudirAt: new Date(),
      mudirCatatan: catatan ?? null,
    });
    await this.notify.mudirApproved(updated, owner);
    return updated;
  }

  async rejectMudir(id: number, actor: Actor, alasanPenolakan?: string): Promise<PerizinanRow> {
    const p = await this.load(id);
    const owner = await this.owner(p);
    assertTransition(p, "menunggu_mudir");
    requireAlasan(alasanPenolakan);
    const updated = await this.repo.update(id, {
      status: "ditolak_mudir",
      mudirId: actor.id,
      mudirAt: new Date(),
      alasanPenolakan,
    });
    await this.notify.mudirRejected(updated, owner);
    return updated;
  }

  async berangkat(id: number, actor: Actor): Promise<PerizinanRow> {
    const p = await this.load(id);
    assertOwner(actor, p);
    assertTransition(p, "disetujui");
    const updated = await this.repo.update(id, { status: "berangkat" });
    await this.notify.berangkat(updated, { id: actor.id, kamarId: actor.kamarId });
    return updated;
  }

  async kembali(id: number, actor: Actor): Promise<PerizinanRow> {
    const p = await this.load(id);
    assertOwner(actor, p);
    assertTransition(p, "berangkat");
    const updated = await this.repo.update(id, {
      status: "kembali",
      tanggalKembaliAktual: new Date(),
    });
    await this.notify.kembali(updated, { id: actor.id, kamarId: actor.kamarId });
    return updated;
  }
}
