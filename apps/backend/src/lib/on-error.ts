import { envelope } from "./envelope";
import { AppError } from "./errors";

type TypeBoxError = { path?: string; message: string };

export function formatTypeBoxErrors(error: unknown): Record<string, string[]> {
  const all = (error as { all?: TypeBoxError[] }).all ?? [];
  const out: Record<string, string[]> = {};
  for (const e of all) {
    const key = (e.path ?? "/").replace(/^\//, "") || "_";
    if (!out[key]) out[key] = [];
    out[key].push(e.message);
  }
  return out;
}

type ErrorHandlerContext = {
  code: string | number;
  error: unknown;
  set: { status?: number | string };
};

export function onErrorHandler({ code, error, set }: ErrorHandlerContext) {
  if (error instanceof AppError) {
    set.status = error.status;
    return envelope.fail(error.message, error.errors);
  }
  if (code === "VALIDATION") {
    set.status = 422;
    return envelope.fail("Input tidak valid.", formatTypeBoxErrors(error));
  }
  if (code === "NOT_FOUND") {
    set.status = 404;
    return envelope.fail("Rute tidak ditemukan.");
  }
  set.status = 500;
  console.error(error);
  return envelope.fail("Terjadi kesalahan pada server.");
}
