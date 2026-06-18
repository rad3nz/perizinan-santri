import { beforeEach, expect, test } from "bun:test";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../../lib/errors";
import type { Notify, PerizinanRepoPort, PerizinanRow, UsersPort } from "./service";
import { PerizinanService } from "./service";

const santri1 = { id: 1, role: "santri" as const, kamarId: 5 };
const santri2 = { id: 2, role: "santri" as const, kamarId: 9 };
const muaddib1 = { id: 11, role: "muaddib" as const, kamarId: 5 };
const muaddib2 = { id: 12, role: "muaddib" as const, kamarId: 9 };
const mudir = { id: 21, role: "mudir" as const, kamarId: null };

function makePerizinan(partial: Partial<PerizinanRow> = {}): PerizinanRow {
  const now = new Date();
  return {
    id: 100,
    userId: santri1.id,
    jenisIzin: "pulang",
    tujuan: "Rumah",
    tanggalKeluar: new Date("2025-02-01"),
    tanggalKembaliRencana: new Date("2025-02-03"),
    tanggalKembaliAktual: null,
    status: "menunggu_muaddib",
    catatan: null,
    muaddibId: null,
    muaddibAt: null,
    muaddibCatatan: null,
    mudirId: null,
    mudirAt: null,
    mudirCatatan: null,
    alasanPenolakan: null,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function fakeRepo(rows: PerizinanRow[]): PerizinanRepoPort {
  const store = new Map(rows.map((r) => [r.id, r]));
  let nextId = 1000;
  return {
    async findById(id) {
      return store.get(id);
    },
    async create(values) {
      const row = makePerizinan({ ...values, id: nextId++ });
      store.set(row.id, row);
      return row;
    },
    async update(id, patch) {
      const row = { ...(store.get(id) as PerizinanRow), ...patch };
      store.set(id, row);
      return row;
    },
  };
}

const usersById = new Map([
  [santri1.id, { id: santri1.id, role: santri1.role, kamarId: santri1.kamarId }],
  [santri2.id, { id: santri2.id, role: santri2.role, kamarId: santri2.kamarId }],
]);
const fakeUsers: UsersPort = {
  async findById(id) {
    return usersById.get(id);
  },
};

type NotifyCall = { method: keyof Notify; perizinanId: number; ownerId: number };
let notifyCalls: NotifyCall[];
function recordingNotify(): Notify {
  const rec = (method: keyof Notify) => async (p: PerizinanRow, owner: { id: number }) => {
    notifyCalls.push({ method, perizinanId: p.id, ownerId: owner.id });
  };
  return {
    perizinanBaru: rec("perizinanBaru"),
    muaddibApproved: rec("muaddibApproved"),
    muaddibRejected: rec("muaddibRejected"),
    mudirApproved: rec("mudirApproved"),
    mudirRejected: rec("mudirRejected"),
    berangkat: rec("berangkat"),
    kembali: rec("kembali"),
  };
}

beforeEach(() => {
  notifyCalls = [];
});

const svcWith = (rows: PerizinanRow[]) =>
  new PerizinanService(fakeRepo(rows), fakeUsers, recordingNotify());

test("submit: creates menunggu_muaddib for the actor, notifies perizinanBaru", async () => {
  const svc = svcWith([]);
  const created = await svc.submit(santri1, {
    jenisIzin: "pulang",
    tujuan: "Rumah",
    tanggalKeluar: "2025-02-01",
    tanggalKembaliRencana: "2025-02-03",
  });
  expect(created.status).toBe("menunggu_muaddib");
  expect(created.userId).toBe(santri1.id);
  expect(notifyCalls).toEqual([
    { method: "perizinanBaru", perizinanId: created.id, ownerId: santri1.id },
  ]);
});

test("submit: tanggalKembaliRencana before tanggalKeluar -> ValidationError", async () => {
  const svc = svcWith([]);
  await expect(
    svc.submit(santri1, {
      jenisIzin: "pulang",
      tujuan: "x",
      tanggalKeluar: "2025-02-05",
      tanggalKembaliRencana: "2025-02-01",
    }),
  ).rejects.toThrow(ValidationError);
});

test("edit: owner may edit while menunggu_muaddib", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  const updated = await svc.edit(p.id, santri1, {
    jenisIzin: "keluar_kota",
    tujuan: "Kota",
    tanggalKeluar: "2025-02-01",
    tanggalKembaliRencana: "2025-02-04",
  });
  expect(updated.tujuan).toBe("Kota");
});

test("edit: non-owner -> ForbiddenError", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  await expect(
    svc.edit(p.id, santri2, {
      jenisIzin: "pulang",
      tujuan: "x",
      tanggalKeluar: "2025-02-01",
      tanggalKembaliRencana: "2025-02-02",
    }),
  ).rejects.toThrow(ForbiddenError);
});

test("edit: after muaddib step -> ConflictError", async () => {
  const p = makePerizinan({ status: "menunggu_mudir" });
  const svc = svcWith([p]);
  await expect(
    svc.edit(p.id, santri1, {
      jenisIzin: "pulang",
      tujuan: "x",
      tanggalKeluar: "2025-02-01",
      tanggalKembaliRencana: "2025-02-02",
    }),
  ).rejects.toThrow(ConflictError);
});

test("approveMuaddib: menunggu_muaddib -> menunggu_mudir, stamps + notifies", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  const u = await svc.approveMuaddib(p.id, muaddib1, "lanjut");
  expect(u.status).toBe("menunggu_mudir");
  expect(u.muaddibId).toBe(muaddib1.id);
  expect(u.muaddibAt).toBeInstanceOf(Date);
  expect(u.muaddibCatatan).toBe("lanjut");
  expect(notifyCalls[0].method).toBe("muaddibApproved");
});

test("approveMuaddib from another kamar -> ForbiddenError", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  await expect(svc.approveMuaddib(p.id, muaddib2)).rejects.toThrow(ForbiddenError);
});

test("approveMuaddib on missing row -> NotFoundError", async () => {
  const svc = svcWith([]);
  await expect(svc.approveMuaddib(999, muaddib1)).rejects.toThrow(NotFoundError);
});

test("rejectMuaddib: -> ditolak_muaddib with alasan, notifies", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  const u = await svc.rejectMuaddib(p.id, muaddib1, "Dokumen kurang");
  expect(u.status).toBe("ditolak_muaddib");
  expect(u.alasanPenolakan).toBe("Dokumen kurang");
  expect(u.muaddibId).toBe(muaddib1.id);
  expect(notifyCalls[0].method).toBe("muaddibRejected");
});

test("rejectMuaddib without alasan -> ValidationError", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  await expect(svc.rejectMuaddib(p.id, muaddib1, "")).rejects.toThrow(ValidationError);
});

test("approveMudir: menunggu_mudir -> disetujui, stamps + notifies", async () => {
  const p = makePerizinan({ status: "menunggu_mudir" });
  const svc = svcWith([p]);
  const u = await svc.approveMudir(p.id, mudir, "ok");
  expect(u.status).toBe("disetujui");
  expect(u.mudirId).toBe(mudir.id);
  expect(u.mudirAt).toBeInstanceOf(Date);
  expect(notifyCalls[0].method).toBe("mudirApproved");
});

test("approveMudir from menunggu_muaddib -> ConflictError", async () => {
  const p = makePerizinan({ status: "menunggu_muaddib" });
  const svc = svcWith([p]);
  await expect(svc.approveMudir(p.id, mudir)).rejects.toThrow(ConflictError);
});

test("rejectMudir: -> ditolak_mudir with alasan, notifies", async () => {
  const p = makePerizinan({ status: "menunggu_mudir" });
  const svc = svcWith([p]);
  const u = await svc.rejectMudir(p.id, mudir, "Tidak memenuhi syarat");
  expect(u.status).toBe("ditolak_mudir");
  expect(u.alasanPenolakan).toBe("Tidak memenuhi syarat");
  expect(notifyCalls[0].method).toBe("mudirRejected");
});

test("berangkat: disetujui -> berangkat, owner only, notifies", async () => {
  const p = makePerizinan({ status: "disetujui" });
  const svc = svcWith([p]);
  const u = await svc.berangkat(p.id, santri1);
  expect(u.status).toBe("berangkat");
  expect(notifyCalls[0].method).toBe("berangkat");
});

test("berangkat by non-owner -> ForbiddenError", async () => {
  const p = makePerizinan({ status: "disetujui" });
  const svc = svcWith([p]);
  await expect(svc.berangkat(p.id, santri2)).rejects.toThrow(ForbiddenError);
});

test("berangkat from menunggu_mudir -> ConflictError", async () => {
  const p = makePerizinan({ status: "menunggu_mudir" });
  const svc = svcWith([p]);
  await expect(svc.berangkat(p.id, santri1)).rejects.toThrow(ConflictError);
});

test("kembali: berangkat -> kembali, sets tanggalKembaliAktual, notifies", async () => {
  const p = makePerizinan({ status: "berangkat" });
  const svc = svcWith([p]);
  const u = await svc.kembali(p.id, santri1);
  expect(u.status).toBe("kembali");
  expect(u.tanggalKembaliAktual).not.toBeNull();
  expect(notifyCalls[0].method).toBe("kembali");
});
