import { afterAll, beforeAll, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { kamar, users } from "../../db/schema";
import { app } from "../../index";

const ADMIN = "users_admin_test";
const MUADDIB = "users_muaddib_test";
const NAMA = "Kamar Users Tes";
let token: string;
let kamarId: number;

async function clean() {
  await db
    .delete(users)
    .where(inArray(users.username, [ADMIN, MUADDIB, "users_dua_test", "users_nonis_test"]));
  await db.delete(kamar).where(eq(kamar.nama, NAMA));
}
beforeAll(async () => {
  await clean();
  const password = await Bun.password.hash("password");
  await db.insert(users).values({ name: "Users Admin", username: ADMIN, password, role: "admin" });
  const [k] = await db.insert(kamar).values({ nama: NAMA, kapasitas: 5 }).$returningId();
  kamarId = k.id;
  await db
    .insert(users)
    .values({ name: "Users Muaddib", username: MUADDIB, password, role: "muaddib", kamarId });
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

const post = (payload: object) =>
  app.handle(
    new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  );

test("second muaddib for the same kamar -> 422 errors.kamarId", async () => {
  const res = await post({
    name: "Dua",
    username: "users_dua_test",
    password: "password",
    role: "muaddib",
    kamarId,
  });
  expect(res.status).toBe(422);
  expect((await res.json()).errors.kamarId).toBeDefined();
});

test("santri without nis -> 422 errors.nis", async () => {
  const res = await post({
    name: "Tanpa NIS",
    username: "users_nonis_test",
    password: "password",
    role: "santri",
    kamarId,
  });
  expect(res.status).toBe(422);
  expect((await res.json()).errors.nis).toBeDefined();
});
