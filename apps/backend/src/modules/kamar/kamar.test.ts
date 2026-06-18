import { afterAll, beforeAll, expect, test } from "bun:test";
import { inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { kamar, users } from "../../db/schema";
import { app } from "../../index";

const ADMIN = "kamar_admin_test";
const SANTRI = "kamar_santri_test";
const NAMA = ["Kamar Tes A", "Kamar Tes Huni"];
let token: string;

async function clean() {
  await db.delete(users).where(inArray(users.username, [ADMIN, SANTRI]));
  await db.delete(kamar).where(inArray(kamar.nama, NAMA));
}
beforeAll(async () => {
  await clean();
  await db.insert(users).values({
    name: "Kamar Admin",
    username: ADMIN,
    password: await Bun.password.hash("password"),
    role: "admin",
  });
  token = (
    await (
      await app.handle(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: ADMIN, password: "password" }),
        }),
      )
    ).json()
  ).data.token;
});
afterAll(clean);

test("POST /api/kamar creates a room with jumlahPenghuni 0", async () => {
  const res = await app.handle(
    new Request("http://localhost/api/kamar", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ nama: NAMA[0], kapasitas: 10 }),
    }),
  );
  const body = await res.json();
  expect(res.status).toBe(201);
  expect(body.data.jumlahPenghuni).toBe(0);
});

test("DELETE /api/kamar/:id is blocked (409) while a user is assigned", async () => {
  const [{ id }] = await db.insert(kamar).values({ nama: NAMA[1], kapasitas: 5 }).$returningId();
  await db.insert(users).values({
    name: "Kamar Santri",
    username: SANTRI,
    password: await Bun.password.hash("password"),
    role: "santri",
    kamarId: id,
    nis: "T1",
    kelas: "10 A",
    waliTelepon: "0811",
  });
  const res = await app.handle(
    new Request(`http://localhost/api/kamar/${id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    }),
  );
  expect(res.status).toBe(409);
  expect((await res.json()).message).toBe("Kamar masih memiliki penghuni dan tidak dapat dihapus.");
});
