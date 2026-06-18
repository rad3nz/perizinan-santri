import { describe, expect, it } from "vitest";
import { statusLabel, statusTone } from "./labels";

describe("labels", () => {
  it("maps status to Indonesian label", () => {
    expect(statusLabel("menunggu_muaddib")).toBe("Menunggu Muaddib");
    expect(statusLabel("menunggu_mudir")).toBe("Menunggu Mudir");
    expect(statusLabel("kembali")).toBe("Kembali");
  });
  it("maps status to Mantine badge tone", () => {
    expect(statusTone("disetujui")).toBe("green");
    expect(statusTone("berangkat")).toBe("blue");
    expect(statusTone("kembali")).toBe("gray");
    expect(statusTone("ditolak_mudir")).toBe("red");
    expect(statusTone("menunggu_muaddib")).toBe("yellow");
  });
});
