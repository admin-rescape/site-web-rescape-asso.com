import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/validations/contact";

describe("Contact Form Validation", () => {
    describe("name field", () => {
        it("should accept a valid full name", () => {
            const result = contactSchema.safeParse({
                name: "Jean Dupont",
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(true);
        });

        it("should reject an empty name", () => {
            const result = contactSchema.safeParse({
                name: "",
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(false);
        });

        it("should reject a name that is too long (> 100 chars)", () => {
            const result = contactSchema.safeParse({
                name: "A".repeat(101),
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("email field", () => {
        it("should accept a valid email", () => {
            const result = contactSchema.safeParse({
                name: "Jean Dupont",
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(true);
        });

        it("should reject an invalid email format", () => {
            const result = contactSchema.safeParse({
                name: "Jean Dupont",
                email: "not-an-email",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(false);
        });

        it("should reject an empty email", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires disponibles.",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("content field (message)", () => {
        it("should accept a message with at least 50 characters", () => {
            const result = contactSchema.safeParse({
                name: "Jean Dupont",
                email: "jean@example.com",
                content: "Bonjour, je voudrais avoir des informations complètes.",
            });
            expect(result.success).toBe(true);
        });

        it("should reject a message shorter than 50 characters", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "jean@example.com",
                content: "Trop court",
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain("50");
            }
        });

        it("should reject a message longer than 2000 characters", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "jean@example.com",
                content: "A".repeat(2001),
            });
            expect(result.success).toBe(false);
        });

        it("should trim leading/trailing whitespace from message", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "jean@example.com",
                content: "  Bonjour, je souhaite avoir des informations sur vos actions solidaires.  ",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.content).not.toMatch(/^\s|\s$/);
            }
        });
    });

    describe("optional phone field", () => {
        it("should accept a valid French phone number", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires.",
                phone: "0644738636",
            });
            expect(result.success).toBe(true);
        });

        it("should accept no phone number (optional)", () => {
            const result = contactSchema.safeParse({
                name: "Jean",
                email: "jean@example.com",
                content: "Bonjour, je souhaite avoir des informations sur vos actions solidaires.",
            });
            expect(result.success).toBe(true);
        });
    });
});
