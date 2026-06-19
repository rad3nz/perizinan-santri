import { describe, expect, it } from "vitest";
import { computeChangedKeys } from "./row-flash";

type Row = { id: number; v: string };
const key = (r: Row) => r.id;
const version = (r: Row) => r.v;

describe("computeChangedKeys", () => {
  it("flags only rows whose version changed, ignoring new rows", () => {
    const prev = new Map<number, string>([
      [1, "a"],
      [2, "a"],
    ]);
    const rows: Row[] = [
      { id: 1, v: "a" }, // unchanged
      { id: 2, v: "b" }, // changed
      { id: 3, v: "a" }, // new -> not flashed
    ];
    const { changed, next } = computeChangedKeys(prev, rows, key, version);
    expect(changed).toEqual([2]);
    expect(next).toEqual(
      new Map([
        [1, "a"],
        [2, "b"],
        [3, "a"],
      ]),
    );
  });

  it("returns no changes on first render (empty prev)", () => {
    const rows: Row[] = [{ id: 1, v: "a" }];
    const { changed } = computeChangedKeys(new Map(), rows, key, version);
    expect(changed).toEqual([]);
  });
});
