import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Timeline from "@/components/sections/Timeline";

const mockItems = [
    {
        title: "2023",
        children: <p>Fondation de l'association</p>
    },
    {
        title: "2024",
        children: <p>Ouverture du local</p>
    }
];

describe("Timeline — Design & Accessibility", () => {
    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", () => {
        const { container } = render(<Timeline items={mockItems} />);
        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });

    it("should explicitly assign role='list' and role='listitem' to ensure screen reader compatibility when list styles are reset", () => {
        render(<Timeline items={mockItems} />);

        const list = screen.getByRole("list");
        expect(list).toBeInTheDocument();

        const listItems = screen.getAllByRole("listitem");
        expect(listItems.length).toBe(2);
    });
});
