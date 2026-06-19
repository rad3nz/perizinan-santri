import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ApproveModal } from "./ApproveModal";

const wrap = (ui: ReactNode) => <MantineProvider>{ui}</MantineProvider>;

describe("ApproveModal", () => {
  it("submits undefined when no note is given", async () => {
    const onSubmit = vi.fn();
    render(wrap(<ApproveModal opened onClose={() => {}} onSubmit={onSubmit} />));
    await userEvent.click(screen.getByRole("button", { name: "Setujui" }));
    expect(onSubmit).toHaveBeenCalledWith(undefined);
  });

  it("submits the trimmed note when provided", async () => {
    const onSubmit = vi.fn();
    render(wrap(<ApproveModal opened onClose={() => {}} onSubmit={onSubmit} />));
    await userEvent.type(screen.getByLabelText(/Catatan/), "  ok  ");
    await userEvent.click(screen.getByRole("button", { name: "Setujui" }));
    expect(onSubmit).toHaveBeenCalledWith("ok");
  });
});
