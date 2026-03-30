import { describe, it, expect } from "vitest";
import { accountingEntrySchema } from "@/lib/validations/accounting";

describe("Accounting Entry Validation", () => {
    const validEntry = {
        type: "RECETTE" as const,
        amount: 50.0,
        category: "DON_RECU" as const,
        description: "Don reçu lors de la collecte du marché",
        date: new Date().toISOString(),
    };

    describe("type field", () => {
        it("should accept RECETTE", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, type: "RECETTE" }).success).toBe(true);
        });

        it("should accept DEPENSE", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, type: "DEPENSE" }).success).toBe(true);
        });

        it("should reject an invalid type", () => {
            const result = accountingEntrySchema.safeParse({ ...validEntry, type: "TRANSFERT" });
            expect(result.success).toBe(false);
        });
    });

    describe("amount field", () => {
        it("should accept a positive amount", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, amount: 125.50 }).success).toBe(true);
        });

        it("should reject zero amount", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, amount: 0 }).success).toBe(false);
        });

        it("should reject negative amount", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, amount: -10 }).success).toBe(false);
        });

        it("should reject amount above 99999.99", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, amount: 100000 }).success).toBe(false);
        });
    });

    describe("category field", () => {
        const validCategories = ["ACHAT", "LOYER", "EVENEMENT", "DON_RECU", "VENTE", "AUTRE"] as const;
        validCategories.forEach((cat) => {
            it(`should accept category: ${cat}`, () => {
                expect(accountingEntrySchema.safeParse({ ...validEntry, category: cat }).success).toBe(true);
            });
        });

        it("should reject an unknown category", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, category: "INCONNU" }).success).toBe(false);
        });
    });

    describe("description field", () => {
        it("should reject a description shorter than 3 chars", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, description: "AB" }).success).toBe(false);
        });

        it("should reject a description longer than 500 chars", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, description: "A".repeat(501) }).success).toBe(false);
        });
    });

    describe("date field", () => {
        it("should reject an invalid date format", () => {
            expect(accountingEntrySchema.safeParse({ ...validEntry, date: "not-a-date" }).success).toBe(false);
        });
    });
});
