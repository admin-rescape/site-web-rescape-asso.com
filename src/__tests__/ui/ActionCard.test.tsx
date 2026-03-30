import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ActionCard } from "@/components/ui/ActionCard";

describe("ActionCard — Design & Accessibility", () => {
    const defaultProps = {
        title: "Test Action",
        description: "Test Description",
        icon: <span>Icon</span>,
    };

    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", () => {
        const { container } = render(<ActionCard {...defaultProps} />);
        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });

    it("should have role='button' and tabIndex={0} on the clickable article for keyboard accessibility", () => {
        render(<ActionCard {...defaultProps} />);
        const article = screen.getByRole("button", { name: /Test Action/i });
        expect(article).toHaveAttribute("tabIndex", "0");
    });

    it("should assign role='dialog' and aria-modal='true' to the modal when open", async () => {
        const user = userEvent.setup();
        render(<ActionCard {...defaultProps} />);

        // Open modal
        const article = screen.getByRole("button", { name: /Test Action/i });
        await user.click(article);

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-modal", "true");
    });
});
