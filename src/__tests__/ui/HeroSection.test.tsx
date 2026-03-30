import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import HeroSection from "@/components/sections/HeroSection";

describe("HeroSection — Design & Accessibility", () => {
    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", () => {
        const { container } = render(<HeroSection />);
        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });
});
