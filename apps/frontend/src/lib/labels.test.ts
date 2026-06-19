import { describe, expect, it } from "vitest";
import { approvalState, statusLabel, statusTone } from "./labels";

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

describe("approvalState", () => {
  it("muaddib pending, mudir none while waiting muaddib", () => {
    expect(approvalState("menunggu_muaddib")).toEqual({ muaddib: "pending", mudir: "none" });
  });
  it("muaddib approved, mudir pending while waiting mudir", () => {
    expect(approvalState("menunggu_mudir")).toEqual({ muaddib: "approved", mudir: "pending" });
  });
  it("both approved for disetujui/berangkat/kembali", () => {
    expect(approvalState("disetujui")).toEqual({ muaddib: "approved", mudir: "approved" });
    expect(approvalState("berangkat")).toEqual({ muaddib: "approved", mudir: "approved" });
    expect(approvalState("kembali")).toEqual({ muaddib: "approved", mudir: "approved" });
  });
  it("muaddib rejected leaves mudir none", () => {
    expect(approvalState("ditolak_muaddib")).toEqual({ muaddib: "rejected", mudir: "none" });
  });
  it("mudir rejected implies muaddib approved", () => {
    expect(approvalState("ditolak_mudir")).toEqual({ muaddib: "approved", mudir: "rejected" });
  });
});
