import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/sections/HeroSection";
import React from "react";
import { describe, it, expect, vi } from "vitest";

// Mock des dépendances pour isoler le test
vi.mock("next/link", () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

vi.mock("framer-motion", async () => {
    const actual = await vi.importActual("framer-motion");
    return {
        ...actual as any,
        motion: {
            div: ({ children, "data-motion-wrapper": mw, ...props }: any) => <div data-motion-wrapper={mw} {...props}>{children}</div>,
            h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
            p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
        }
    };
});

vi.mock("@/components/ui/Mascot", () => ({
    Mascot: () => <div data-testid="mascot-mock" />
}));
vi.mock("@/components/ui/Badge", () => ({
    Badge: () => <div data-testid="badge-mock" />
}));
vi.mock("@/components/ui/OpeningStatus", () => ({
    OpeningStatus: () => <div data-testid="opening-status-mock" />
}));

describe("HeroSection - Animation & Design Best Practices", () => {
    it("renders without crashing", () => {
        render(<HeroSection />);
        expect(screen.getByText(/Ensemble,/i)).toBeInTheDocument();
        expect(screen.getByText(/Lutte Anti Gaspillage Solidaire à Aniche/i)).toBeInTheDocument();
    });

    it("uses Framer Motion wrappers for entrance animation", () => {
        const { container } = render(<HeroSection />);
        const contentBlock = container.querySelector("#hero-content");

        // On s'attend à ce que le bloc de contenu soit encapsulé dans motion.div
        expect(contentBlock).toHaveAttribute("data-motion-wrapper", "true");
    });
});
