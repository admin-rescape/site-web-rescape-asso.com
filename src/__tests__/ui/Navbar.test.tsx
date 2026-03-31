import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// UI test for the Navbar component — current public behavior + future portal behavior
// Tests will be partially Red (portal branch) until Phase 2

vi.mock("next-auth/react", () => ({
    useSession: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode;[key: string]: unknown }) => <a href={href} {...props}>{children}</a>,
}));

import { useSession } from "next-auth/react";

// Dynamic import to avoid circular deps with Next.js
const mockUseSession = vi.mocked(useSession);

describe("Navbar — Public (unauthenticated)", () => {
    beforeEach(() => {
        mockUseSession.mockReturnValue({
            data: null,
            status: "unauthenticated",
            update: vi.fn(),
        });
    });

    it("should display the Rescape logo as public site brand", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        const { container } = render(<Navbar />);
        expect(container.textContent).toContain("Rescape");
    });

    it("should show public navigation links (Notre Histoire, Actions, Actualités)", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        render(<Navbar />);
        // The Navbar has desktop + mobile versions of each link, so getAllByRole is used
        expect(screen.getAllByRole("link", { name: /notre histoire/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("link", { name: /actions/i }).length).toBeGreaterThan(0);
    });

    it("should NOT show admin dashboard links when unauthenticated", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        render(<Navbar />);
        expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /compta/i })).not.toBeInTheDocument();
    });
});

describe("Navbar — Public (authenticated any role)", () => {
    beforeEach(() => {
        mockUseSession.mockReturnValue({
            data: {
                user: { id: "user-1", name: "User", email: "user@rescape-asso.com", role: "DIRECTRICE" },
                expires: "9999-12-31T23:59:59.999Z"
            } as never,
            status: "authenticated",
            update: vi.fn(),
        } as never);
    });

    it("should display the standard Rescape logo when authenticated on the public site", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        const { container } = render(<Navbar />);
        expect(container.textContent).toContain("Rescape");
        expect(screen.queryByText(/rescape admin/i)).not.toBeInTheDocument();
    });

    it("should still show public navigation links (Notre Histoire) when authenticated", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        render(<Navbar />);
        expect(screen.getAllByRole("link", { name: /notre histoire/i }).length).toBeGreaterThan(0);
    });

    it("should show 'Mon Espace' and Logout buttons", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        render(<Navbar />);
        expect(screen.getAllByRole("link", { name: /mon espace/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: /déconnexion/i }).length).toBeGreaterThan(0);
    });

    it("should NOT show portal specific links directly in Navbar", async () => {
        const { default: Navbar } = await import("@/components/layout/Navbar");
        render(<Navbar />);
        expect(screen.queryByRole("link", { name: /articles/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /comptabilité/i })).not.toBeInTheDocument();
    });
});
