import { db, pool } from "./client";
import { kamar, notifications, perizinan, users } from "./schema";

type NewPerizinan = typeof perizinan.$inferInsert;

async function main() {
  const existing = await db.select({ id: kamar.id }).from(kamar);
  if (existing.length > 0) {
    console.log("Seed sudah ada, dilewati.");
    return;
  }

  const password = await Bun.password.hash("password");

  const [k1] = await db
    .insert(kamar)
    .values({ nama: "Kamar Al-Farabi", kapasitas: 20 })
    .$returningId();
  const [k2] = await db
    .insert(kamar)
    .values({ nama: "Kamar Al-Ghazali", kapasitas: 20 })
    .$returningId();
  const [k3] = await db
    .insert(kamar)
    .values({ nama: "Kamar Ibnu Sina", kapasitas: 15 })
    .$returningId();

  await db
    .insert(users)
    .values({ name: "Administrator", username: "admin", password, role: "admin" });
  const [mudir] = await db
    .insert(users)
    .values({ name: "Ustadz Mudir", username: "mudir", password, role: "mudir" })
    .$returningId();
  const [m1] = await db
    .insert(users)
    .values({
      name: "Ustadz Al-Farabi",
      username: "muaddib1",
      password,
      role: "muaddib",
      kamarId: k1.id,
    })
    .$returningId();
  const [m2] = await db
    .insert(users)
    .values({
      name: "Ustadz Al-Ghazali",
      username: "muaddib2",
      password,
      role: "muaddib",
      kamarId: k2.id,
    })
    .$returningId();

  // santri1..10 — kamar: 1-4 -> k1, 5-8 -> k2, 9-10 -> k3
  const santriKamar = [k1.id, k1.id, k1.id, k1.id, k2.id, k2.id, k2.id, k2.id, k3.id, k3.id];
  const santriIds: number[] = [];
  for (let i = 0; i < 10; i++) {
    const n = i + 1;
    const [row] = await db
      .insert(users)
      .values({
        name: `Santri ${n}`,
        username: `santri${n}`,
        password,
        role: "santri",
        kamarId: santriKamar[i],
        nis: `202400${n}`,
        kelas: n % 2 === 0 ? "11 B" : "10 A",
        waliTelepon: `08123456780${n}`,
      })
      .$returningId();
    santriIds.push(row.id);
  }
  const s = (n: number) => santriIds[n - 1]; // s(1) = santri1
  const muaddibFor = (kamarId: number) => (kamarId === k1.id ? m1.id : m2.id);

  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  };

  const jenis: NewPerizinan["jenisIzin"][] = [
    "pulang",
    "keluar_kota",
    "kegiatan_sekolah",
    "lainnya",
  ];
  const tujuanFor: Record<string, string> = {
    pulang: "Pulang ke rumah",
    keluar_kota: "Berobat ke rumah sakit",
    kegiatan_sekolah: "Lomba cerdas cermat",
    lainnya: "Keperluan keluarga",
  };
  const base = (santriId: number, j: number): NewPerizinan => ({
    userId: santriId,
    jenisIzin: jenis[j % 4],
    tujuan: tujuanFor[jenis[j % 4]],
    tanggalKeluar: day(j),
    tanggalKembaliRencana: day(j + 2),
  });
  const muaddibStamp = (kamarId: number) => ({
    muaddibId: muaddibFor(kamarId),
    muaddibAt: day(-2),
    muaddibCatatan: "Disetujui.",
  });
  const mudirStamp = { mudirId: mudir.id, mudirAt: day(-1), mudirCatatan: "Disetujui." };

  const rows: NewPerizinan[] = [
    // 3 menunggu_muaddib
    { ...base(s(1), 0), status: "menunggu_muaddib" },
    { ...base(s(2), 1), status: "menunggu_muaddib" },
    { ...base(s(5), 2), status: "menunggu_muaddib" },
    // 2 menunggu_mudir (muaddib-approved)
    { ...base(s(3), 3), status: "menunggu_mudir", ...muaddibStamp(k1.id) },
    { ...base(s(6), 0), status: "menunggu_mudir", ...muaddibStamp(k2.id) },
    // 2 disetujui
    { ...base(s(4), 1), status: "disetujui", ...muaddibStamp(k1.id), ...mudirStamp },
    { ...base(s(7), 2), status: "disetujui", ...muaddibStamp(k2.id), ...mudirStamp },
    // 2 berangkat
    { ...base(s(1), 3), status: "berangkat", ...muaddibStamp(k1.id), ...mudirStamp },
    { ...base(s(5), 0), status: "berangkat", ...muaddibStamp(k2.id), ...mudirStamp },
    // 2 kembali (one today, one past)
    {
      ...base(s(2), 1),
      status: "kembali",
      ...muaddibStamp(k1.id),
      ...mudirStamp,
      tanggalKembaliAktual: day(0),
    },
    {
      ...base(s(6), 2),
      status: "kembali",
      ...muaddibStamp(k2.id),
      ...mudirStamp,
      tanggalKembaliAktual: day(-3),
    },
    // 2 ditolak_muaddib (terminal)
    {
      ...base(s(3), 3),
      status: "ditolak_muaddib",
      muaddibId: m1.id,
      muaddibAt: day(-2),
      alasanPenolakan: "Dokumen pendukung belum lengkap.",
    },
    {
      ...base(s(7), 0),
      status: "ditolak_muaddib",
      muaddibId: m2.id,
      muaddibAt: day(-2),
      alasanPenolakan: "Jadwal bentrok dengan kegiatan pesantren.",
    },
    // 2 ditolak_mudir (terminal)
    {
      ...base(s(4), 1),
      status: "ditolak_mudir",
      ...muaddibStamp(k1.id),
      mudirId: mudir.id,
      mudirAt: day(-1),
      alasanPenolakan: "Tidak memenuhi syarat perizinan.",
    },
    {
      ...base(s(8), 2),
      status: "ditolak_mudir",
      ...muaddibStamp(k2.id),
      mudirId: mudir.id,
      mudirAt: day(-1),
      alasanPenolakan: "Belum waktunya diberikan izin.",
    },
  ];
  await db.insert(perizinan).values(rows);

  await db.insert(notifications).values([
    {
      recipientId: m1.id,
      type: "perizinan_baru",
      message: "Santri 1 mengajukan perizinan baru.",
      perizinanId: null,
    },
    {
      recipientId: mudir.id,
      type: "disetujui_muaddib",
      message: "Ada perizinan menunggu persetujuan Mudir.",
      perizinanId: null,
    },
  ]);

  console.log("Seed selesai: 3 kamar, 14 pengguna, 15 perizinan.");
}

await main();
await pool.end();
