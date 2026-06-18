import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { RejectModal } from "./RejectModal";

const wrap = (ui: ReactNode) => <MantineProvider>{ui}</MantineProvider>;

describe("RejectModal", () => {
  it("disables Tolak until a reason is typed, then submits the reason", async () => {
    const onSubmit = vi.fn();
    render(wrap(<RejectModal opened onClose={() => {}} onSubmit={onSubmit} />));

    const button = screen.getByRole("button", { name: "Tolak" });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Alasan penolakan/), "Tidak diizinkan");
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith("Tidak diizinkan");
  });
});
