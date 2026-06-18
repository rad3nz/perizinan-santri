import { afterAll, beforeAll, expect, test } from "bun:test";
import { eq, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { notifications, users } from "../../db/schema";
import { app } from "../../index";

const ALICE = "notif_alice_test";
const BOB = "notif_bob_test";
let aliceToken: string;
let bobNotifId: number;

async function clean() {
  const olds = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.username, [ALICE, BOB]));
  for (const u of olds) await db.delete(notifications).where(eq(notifications.recipientId, u.id));
  await db.delete(users).where(inArray(users.username, [ALICE, BOB]));
}
beforeAll(async () => {
  await clean();
  const password = await Bun.password.hash("password");
  await db.insert(users).values({ name: "Alice", username: ALICE, password, role: "admin" });
  const [bob] = await db
    .insert(users)
    .values({ name: "Bob", username: BOB, password, role: "admin" })
    .$returningId();
  const [{ id }] = await db
    .insert(notifications)
    .values({ recipientId: bob.id, type: "perizinan_baru", message: "x", perizinanId: null })
    .$returningId();
  bobNotifId = id;
  aliceToken = (
    await (
      await app.handle(
        new Request("http://localhost/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: ALICE, password: "password" }),
        }),
      )
    ).json()
  ).data.token;
});
afterAll(clean);

test("GET /api/notifications returns the envelope with unreadCount", async () => {
  const res = await app.handle(
    new Request("http://localhost/api/notifications", {
      headers: { authorization: `Bearer ${aliceToken}` },
    }),
  );
  const body = await res.json();
  expect(res.status).toBe(200);
  expect(typeof body.data.unreadCount).toBe("number");
});

test("marking another user's notification read -> 403", async () => {
  const res = await app.handle(
    new Request(`http://localhost/api/notifications/${bobNotifId}/read`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${aliceToken}` },
    }),
  );
  expect(res.status).toBe(403);
});
