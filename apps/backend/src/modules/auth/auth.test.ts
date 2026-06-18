import { afterAll, beforeAll, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { app } from "../../index";

const U = "auth_admin_test";

async function clean() {
  await db.delete(users).where(eq(users.username, U));
}
beforeAll(async () => {
  await clean();
  await db.insert(users).values({
    name: "Auth Admin",
    username: U,
    password: await Bun.password.hash("password"),
    role: "admin",
  });
});
afterAll(clean);

const login = (username: string, pw: string) =>
  app.handle(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password: pw }),
    }),
  );

test("login ok returns token + user without password", async () => {
  const res = await login(U, "password");
  const body = await res.json();
  expect(res.status).toBe(200);
  expect(typeof body.data.token).toBe("string");
  expect(body.data.user.password).toBeUndefined();
});

test("login wrong password -> 401 Indonesian message", async () => {
  const res = await login(U, "salah");
  expect(res.status).toBe(401);
  expect((await res.json()).message).toBe("Username atau password salah.");
});

test("GET /api/auth/me returns the current user", async () => {
  const token = (await (await login(U, "password")).json()).data.token;
  const res = await app.handle(
    new Request("http://localhost/api/auth/me", { headers: { authorization: `Bearer ${token}` } }),
  );
  expect(res.status).toBe(200);
  expect((await res.json()).data.username).toBe(U);
});

test("protected route without token -> 401", async () => {
  expect((await app.handle(new Request("http://localhost/api/auth/me"))).status).toBe(401);
});
