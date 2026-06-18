import { expect, test } from "bun:test";
import { ConflictError, ValidationError } from "./errors";
import { formatTypeBoxErrors, onErrorHandler } from "./on-error";

function makeSet() {
  return { status: 200 as number | string };
}

test("AppError maps to its status + fail envelope (with errors)", () => {
  const set = makeSet();
  const out = onErrorHandler({
    code: "UNKNOWN",
    error: new ValidationError("Input tidak valid.", { nama: ["wajib diisi"] }),
    set,
  });
  expect(set.status).toBe(422);
  expect(out).toEqual({
    success: false,
    data: null,
    message: "Input tidak valid.",
    errors: { nama: ["wajib diisi"] },
  });
});

test("ConflictError maps to 409", () => {
  const set = makeSet();
  onErrorHandler({ code: "UNKNOWN", error: new ConflictError("Bentrok."), set });
  expect(set.status).toBe(409);
});

test("VALIDATION code maps to 422 with formatted field errors", () => {
  const set = makeSet();
  const error = { all: [{ path: "/username", message: "wajib diisi" }] };
  const out = onErrorHandler({ code: "VALIDATION", error, set });
  expect(set.status).toBe(422);
  expect(out).toEqual({
    success: false,
    data: null,
    message: "Input tidak valid.",
    errors: { username: ["wajib diisi"] },
  });
});

test("NOT_FOUND code maps to 404 route message", () => {
  const set = makeSet();
  const out = onErrorHandler({ code: "NOT_FOUND", error: new Error("x"), set });
  expect(set.status).toBe(404);
  expect(out.message).toBe("Rute tidak ditemukan.");
});

test("unknown error maps to generic 500 (no internals leaked)", () => {
  const set = makeSet();
  const out = onErrorHandler({ code: "UNKNOWN", error: new Error("boom"), set });
  expect(set.status).toBe(500);
  expect(out.message).toBe("Terjadi kesalahan pada server.");
});

test("formatTypeBoxErrors groups messages by field; root path → '_'", () => {
  const out = formatTypeBoxErrors({
    all: [
      { path: "/nis", message: "wajib diisi" },
      { path: "/nis", message: "minimal 3 karakter" },
      { message: "tak berpath" },
    ],
  });
  expect(out).toEqual({
    nis: ["wajib diisi", "minimal 3 karakter"],
    _: ["tak berpath"],
  });
});
