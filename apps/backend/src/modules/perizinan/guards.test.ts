import { expect, test } from "bun:test";
import { ConflictError, ForbiddenError, ValidationError } from "../../lib/errors";
import {
  assertCanView,
  assertOwner,
  assertSameKamar,
  assertTransition,
  requireAlasan,
} from "./guards";

const santri = { id: 1, role: "santri" as const, kamarId: 5 };
const muaddibSameKamar = { id: 11, role: "muaddib" as const, kamarId: 5 };
const muaddibOtherKamar = { id: 12, role: "muaddib" as const, kamarId: 9 };
const mudir = { id: 21, role: "mudir" as const, kamarId: null };
const admin = { id: 31, role: "admin" as const, kamarId: null };
const p = { userId: 1, status: "menunggu_muaddib" as const };

test("assertTransition passes on the expected status, throws ConflictError otherwise", () => {
  expect(() => assertTransition(p, "menunggu_muaddib")).not.toThrow();
  expect(() => assertTransition(p, "disetujui")).toThrow(ConflictError);
});

test("assertSameKamar passes for same kamar, throws ForbiddenError for another", () => {
  expect(() => assertSameKamar(muaddibSameKamar, 5)).not.toThrow();
  expect(() => assertSameKamar(muaddibOtherKamar, 5)).toThrow(ForbiddenError);
});

test("assertOwner passes for the owner, throws ForbiddenError otherwise", () => {
  expect(() => assertOwner(santri, p)).not.toThrow();
  expect(() => assertOwner({ ...santri, id: 2 }, p)).toThrow(ForbiddenError);
});

test("requireAlasan throws ValidationError on empty/whitespace, passes on text", () => {
  expect(() => requireAlasan("")).toThrow(ValidationError);
  expect(() => requireAlasan("   ")).toThrow(ValidationError);
  expect(() => requireAlasan("alasan jelas")).not.toThrow();
});

test("assertCanView: admin and mudir always allowed", () => {
  expect(() => assertCanView(admin, p, 5)).not.toThrow();
  expect(() => assertCanView(mudir, p, 5)).not.toThrow();
});

test("assertCanView: owner allowed; muaddib only for same kamar; others 403", () => {
  expect(() => assertCanView(santri, p, 5)).not.toThrow();
  expect(() => assertCanView(muaddibSameKamar, p, 5)).not.toThrow();
  expect(() => assertCanView(muaddibOtherKamar, p, 5)).toThrow(ForbiddenError);
  expect(() => assertCanView({ id: 2, role: "santri" as const, kamarId: 5 }, p, 5)).toThrow(
    ForbiddenError,
  );
});
