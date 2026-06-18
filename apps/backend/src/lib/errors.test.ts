import { expect, test } from "bun:test";
import { envelope } from "./envelope";
import { ConflictError, NotFoundError, ValidationError } from "./errors";

test("envelope.ok wraps data with success + default message", () => {
  expect(envelope.ok({ id: 1 })).toEqual({
    success: true,
    data: { id: 1 },
    message: "Berhasil.",
  });
});

test("envelope.ok accepts a custom message", () => {
  expect(envelope.ok(null, "Berhasil masuk.")).toEqual({
    success: true,
    data: null,
    message: "Berhasil masuk.",
  });
});

test("envelope.fail omits errors when not given", () => {
  expect(envelope.fail("Gagal.")).toEqual({
    success: false,
    data: null,
    message: "Gagal.",
  });
});

test("envelope.fail includes field errors when given", () => {
  expect(envelope.fail("Input tidak valid.", { nama: ["wajib diisi"] })).toEqual({
    success: false,
    data: null,
    message: "Input tidak valid.",
    errors: { nama: ["wajib diisi"] },
  });
});

test("domain errors carry the right HTTP status", () => {
  expect(new ConflictError("x").status).toBe(409);
  expect(new ValidationError("x").status).toBe(422);
  expect(new NotFoundError().status).toBe(404);
});

test("ValidationError carries field errors; NotFoundError has a default message", () => {
  const v = new ValidationError("Input tidak valid.", { nis: ["NIS wajib diisi."] });
  expect(v.errors).toEqual({ nis: ["NIS wajib diisi."] });
  expect(new NotFoundError().message).toBe("Data tidak ditemukan.");
});
