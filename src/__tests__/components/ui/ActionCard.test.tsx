import { render, screen } from "@testing-library/react";
import { ActionCard } from "@/components/ui/ActionCard";
import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", async () => {
    const actual = await vi.importActual("framer-motion");
    return {
        ...actual as any,
        motion: {
            article: ({ children, "data-motion-wrapper": mw, ...props }: any) => <article data-motion-wrapper={mw} {...props}>{children}</article>,
        }
    };
});

describe("ActionCard - Animation & Design Best Practices", () => {
    const mockProps = {
        title: "Test Action",
        description: "Test Description",
        icon: <span>Icon</span>,
    };

    it("renders standard props correctly", () => {
        render(<ActionCard {...mockProps} />);
        expect(screen.getByText("Test Action")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("uses Framer Motion article wrapper for scroll animations", () => {
        render(<ActionCard {...mockProps} />);
        const article = screen.getByRole("button", { name: /Test Action/i });

        // On s'attend à ce que l'article rendu soit un motion.article (vérifié par un marqueur de donnée)
        expect(article).toHaveAttribute("data-motion-wrapper", "true");
    });
});
