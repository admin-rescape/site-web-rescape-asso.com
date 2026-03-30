import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

vi.mock("@/actions/messages", () => ({
    createMessage: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ContactForm — Character Counter", () => {
    it("should display the character counter above the message field", async () => {
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        expect(screen.getByText(/0 \/ 50 caractères min\./i)).toBeInTheDocument();
    });

    it("should update the counter in real-time as the user types", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        const textarea = screen.getByRole("textbox", { name: /message/i });
        await user.type(textarea, "Bonjour");
        expect(screen.getByText(/7 \/ 50 caractères min\./i)).toBeInTheDocument();
    });

    it("should show counter in gray when below 50 chars", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        const textarea = screen.getByRole("textbox", { name: /message/i });
        await user.type(textarea, "Court");
        const counter = screen.getByText(/5 \/ 50 caractères min\./i);
        expect(counter.classList.contains("text-success")).toBe(false);
    });

    it("should turn counter green when 50+ chars reached", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        const textarea = screen.getByRole("textbox", { name: /message/i });
        await user.type(textarea, "A".repeat(50));
        const counter = screen.getByText(/50 \/ 50 caractères min\./i);
        expect(counter.classList.contains("text-success")).toBe(true);
    });
});

describe("ContactForm — Design & Accessibility", () => {
    it("should not contain hardcoded pixel values in classNames (Token Sobriety)", async () => {
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        const { container } = render(<ContactForm />);
        const elementsWithPixels = container.querySelectorAll('[class*="px]"]');
        expect(elementsWithPixels.length).toBe(0);
    });

    it("should properly assign aria-invalid and aria-describedby to inputs with errors", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);

        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput.getAttribute("aria-invalid")).not.toBe("true");

        await user.click(screen.getByRole("button", { name: /envoyer/i }));

        expect(emailInput).toHaveAttribute("aria-invalid", "true");
        // Check if error message ID exists and matches aria-describedby
        const describedBy = emailInput.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        if (describedBy) {
            expect(document.getElementById(describedBy)).toBeInTheDocument();
        }
    });

    it("should include aria-required attributes on mandatory fields", async () => {
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);

        expect(screen.getByLabelText(/nom complet/i)).toHaveAttribute("aria-required", "true");
        expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-required", "true");
    });
});

describe("ContactForm — Form Submission", () => {
    it("should show success confirmation after valid submission", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        const { createMessage } = await import("@/actions/messages");
        vi.mocked(createMessage).mockResolvedValue({ success: true } as ReturnType<typeof createMessage> extends Promise<infer T> ? T : never);
        render(<ContactForm />);

        await user.type(screen.getByLabelText(/nom complet/i), "Jean Dupont");
        await user.type(screen.getByLabelText(/email/i), "jean@example.com");
        await user.type(
            screen.getByRole("textbox", { name: /message/i }),
            "Bonjour, je souhaite en savoir plus sur vos actions solidaires disponibles."
        );
        // Check RGPD checkbox
        await user.click(screen.getByLabelText(/j'accepte/i));
        await user.click(screen.getByRole("button", { name: /envoyer/i }));
        expect(await screen.findByText(/c'est envoyé/i)).toBeInTheDocument();
    });

    it("should show validation error when message is too short", async () => {
        const user = userEvent.setup();
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        await user.type(screen.getByLabelText(/nom complet/i), "Jean Dupont");
        await user.type(screen.getByLabelText(/email/i), "jean@example.com");
        await user.type(screen.getByRole("textbox", { name: /message/i }), "Court");
        await user.click(screen.getByLabelText(/j\u2019accepte|j'accepte/i));
        await user.click(screen.getByRole("button", { name: /envoyer/i }));
        expect(await screen.findByText(/au moins 50 caract/i)).toBeInTheDocument();
    });

    it("should disable the submit button while loading", async () => {
        const user = userEvent.setup();
        const { createMessage } = await import("@/actions/messages");
        vi.mocked(createMessage).mockImplementation(() => new Promise(() => { }));
        const { default: ContactForm } = await import("@/components/forms/ContactForm");
        render(<ContactForm />);
        await user.type(screen.getByLabelText(/nom complet/i), "Jean Dupont");
        await user.type(screen.getByLabelText(/email/i), "jean@example.com");
        await user.type(
            screen.getByRole("textbox", { name: /message/i }),
            "Bonjour, je souhaite en savoir plus sur vos actions solidaires."
        );
        await user.click(screen.getByLabelText(/j'accepte/i));
        const submitBtn = screen.getByRole("button", { name: /envoyer/i });
        await user.click(submitBtn);
        expect(submitBtn).toBeDisabled();
    });
});
