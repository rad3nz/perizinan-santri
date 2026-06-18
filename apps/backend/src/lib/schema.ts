import type { JENIS_IZIN, PERIZINAN_STATUS, ROLES } from "@perizinan/shared";
import { t } from "elysia";

// `t.Union(arr.map(t.Literal))` infers `Static` as `never` because a mapped array
// is not a tuple — which made Eden expose these fields as `never` on the client.
// Explicit tuples infer the literal union correctly; the `_drift` guard below fails
// the build if any tuple stops matching its shared enum.

export const jenisIzinSchema = t.Union([
  t.Literal("pulang"),
  t.Literal("keluar_kota"),
  t.Literal("kegiatan_sekolah"),
  t.Literal("lainnya"),
]);

export const statusSchema = t.Union([
  t.Literal("menunggu_muaddib"),
  t.Literal("ditolak_muaddib"),
  t.Literal("menunggu_mudir"),
  t.Literal("ditolak_mudir"),
  t.Literal("disetujui"),
  t.Literal("berangkat"),
  t.Literal("kembali"),
]);

export const roleSchema = t.Union([
  t.Literal("santri"),
  t.Literal("muaddib"),
  t.Literal("mudir"),
  t.Literal("admin"),
]);

type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export const _drift: [
  IsExact<typeof jenisIzinSchema.static, (typeof JENIS_IZIN)[number]>,
  IsExact<typeof statusSchema.static, (typeof PERIZINAN_STATUS)[number]>,
  IsExact<typeof roleSchema.static, (typeof ROLES)[number]>,
] = [true, true, true];
