import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MegaCalendar } from "@/components/admin/MegaCalendar";
import * as calendarActions from "@/actions/calendar";

// Mock the calendar action
vi.mock("@/actions/calendar", () => ({
    getGlobalCalendarEvents: vi.fn(),
}));

describe("MegaCalendar — Design & Accessibility", () => {
    it("should have role='status' or aria-live='polite' on the loading indicator", async () => {
        // Mock to return a promise that doesn't resolve immediately to test loading state
        vi.mocked(calendarActions.getGlobalCalendarEvents).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
        );

        render(<MegaCalendar />);
        const loader = screen.getByText(/chargement du calendrier en cours/i);
        expect(loader.closest('[role="status"], [aria-live="polite"]')).toBeInTheDocument();
    });

    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", async () => {
        // Mock to return empty array immediately to test rendered state
        vi.mocked(calendarActions.getGlobalCalendarEvents).mockResolvedValue([]);
        const { container } = render(<MegaCalendar />);

        // Wait for rendering
        await screen.findByText(/action associative/i);

        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });
});
