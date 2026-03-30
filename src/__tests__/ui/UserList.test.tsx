import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { UserList } from "@/components/admin/UserList";

const mockUsers = [
    {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "BENEVOLE",
        organizationName: null,
        createdAt: new Date(),
    }
];

const mockCurrentUser = {
    id: "admin-1",
    role: "SUPER_ADMIN",
};

describe("UserList — Design & Accessibility", () => {
    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", () => {
        const { container } = render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);
        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });

    it("should assign role='dialog' and aria-modal='true' to the delete confirmation modal", async () => {
        const user = userEvent.setup();
        render(<UserList users={mockUsers} currentUser={mockCurrentUser} />);

        // Find and click the delete button
        const deleteButton = screen.getByTitle("Supprimer cet accès");
        await user.click(deleteButton);

        // Wait for the modal to open
        await waitFor(() => {
            const dialog = screen.getByRole("dialog");
            expect(dialog).toBeInTheDocument();
            expect(dialog).toHaveAttribute("aria-modal", "true");
        });
    });
});
