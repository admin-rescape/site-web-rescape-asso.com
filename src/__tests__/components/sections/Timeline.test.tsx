import { render, screen } from "@testing-library/react";
import Timeline from "@/components/sections/Timeline";
import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("framer-motion", async () => {
    const actual = await vi.importActual("framer-motion");
    return {
        ...actual as any,
        motion: {
            ol: ({ children, "data-motion-wrapper": mw, ...props }: any) => <ol data-motion-wrapper={mw} {...props}>{children}</ol>,
            li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
        }
    };
});

const mockItems = [
    { title: "Avril 2024", children: "Lancement officiel de l'association Rescape", icon: "⭐" },
    { title: "Mai 2024", children: "Première action d'aide", icon: "🤝" }
];

describe("Timeline - Animation & Design Best Practices", () => {
    it("renders timeline events correctly", () => {
        render(<Timeline items={mockItems} />);
        expect(screen.getByText("Avril 2024")).toBeInTheDocument();
        expect(screen.getByText(/Lancement officiel de l'association Rescape/i)).toBeInTheDocument();
    });

    it("uses Framer Motion wrapper for stagger animations", () => {
        const { container } = render(<Timeline items={mockItems} />);
        const timelineList = container.querySelector(".timeline");

        // On s'attend à ce que la liste soit animée via Framer Motion
        expect(timelineList).toHaveAttribute("data-motion-wrapper", "true");
    });
});
