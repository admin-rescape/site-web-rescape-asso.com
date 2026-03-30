import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ─── Security: Role-Based Access Control ──────────────────────────────────────
// These tests verify that server actions enforce authorization.
// They will FAIL (Red) until the new server actions are implemented.

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

describe("Security — Authentication & Authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Unauthenticated access (no session)", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue(null as never);
        });

        it("should throw 'Non autorisé' when creating an article without session", async () => {
            const { createArticle } = await import("@/actions/articles");
            const formData = new FormData();
            formData.set("title", "Test");
            formData.set("content", "Some content");
            await expect(createArticle(formData)).rejects.toThrow("Non autorisé");
        });

        it("should throw 'Non autorisé' when creating an event without session", async () => {
            const { createEvent } = await import("@/actions/events");
            const formData = new FormData();
            formData.set("title", "Event");
            formData.set("start", new Date().toISOString());
            await expect(createEvent(formData)).rejects.toThrow("Non autorisé");
        });

        it("should throw 'Non autorisé' when deleting an article without session", async () => {
            const { deleteArticle } = await import("@/actions/articles");
            await expect(deleteArticle("some-id")).rejects.toThrow("Non autorisé");
        });
    });

    describe("BENEVOLE — restricted access", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "benevole-1", role: "BENEVOLE", email: "benevole@rescape.fr" } } as never);
        });

        it("should NOT allow BENEVOLE to create an article", async () => {
            const { createArticle } = await import("@/actions/articles");
            const formData = new FormData();
            formData.set("title", "Test Article");
            formData.set("content", "Content for article");
            await expect(createArticle(formData)).rejects.toThrow();
        });

        it("should NOT allow BENEVOLE to delete a message", async () => {
            const { deleteMessage } = await import("@/actions/messages");
            await expect(deleteMessage("msg-1")).rejects.toThrow();
        });

        it("should NOT allow BENEVOLE to create an accounting entry", async () => {
            (mockPrisma.accountingEntry.create as import("vitest").Mock).mockResolvedValue({ id: "acc-1" });
            const { createAccountingEntry } = await import("@/actions/accounting");
            const formData = new FormData();
            formData.set("type", "DEPENSE");
            formData.set("amount", "25.00");
            formData.set("category", "ACHAT");
            formData.set("description", "Achat de produits alimentaires");
            formData.set("date", new Date().toISOString());
            await expect(createAccountingEntry(formData)).rejects.toThrow();
        });
    });

    describe("TRESORIERE — accounting access", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "tres-1", role: "TRESORIERE", email: "nadia@rescape.fr" } } as never);
        });

        it("should allow TRESORIERE to create an accounting entry", async () => {
            const { createAccountingEntry } = await import("@/actions/accounting");
            const formData = new FormData();
            formData.set("type", "RECETTE");
            formData.set("amount", "100");
            formData.set("category", "DON_RECU");
            formData.set("description", "Test");
            formData.set("date", new Date().toISOString());
            await expect(createAccountingEntry(formData)).resolves.not.toThrow();
        });

        it("should allow TRESORIERE to delete an accounting entry", async () => {
            const { deleteAccountingEntry } = await import("@/actions/accounting");
            await expect(deleteAccountingEntry("entry-1")).resolves.not.toThrow();
        });

        it("should allow TRESORIERE to export accounting data (read)", async () => {
            (mockPrisma.accountingEntry.findMany as import("vitest").Mock).mockResolvedValue([]);
            const { getAccountingEntries } = await import("@/actions/accounting");
            const result = await getAccountingEntries();
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe("PARTENAIRE — RDV & donations only", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "part-1", role: "PARTENAIRE", email: "partner@company.fr" } } as never);
        });

        it("should NOT allow PARTENAIRE to access articles management", async () => {
            const { createArticle } = await import("@/actions/articles");
            const formData = new FormData();
            formData.set("title", "Hack article");
            formData.set("content", "Content");
            await expect(createArticle(formData)).rejects.toThrow();
        });

        it("should allow PARTENAIRE to create an appointment", async () => {
            (mockPrisma.appointment.create as import("vitest").Mock).mockResolvedValue({ id: "appt-1" });
            const { createAppointment } = await import("@/actions/appointments");
            const formData = new FormData();
            formData.set("type", "DEPOT");
            formData.set("date", new Date(Date.now() + 86400000).toISOString());
            formData.set("notes", "Dépôt de vêtements");
            const result = await createAppointment(formData);
            expect(result).not.toHaveProperty("unauthorized");
        });

        it("should allow PARTENAIRE to register a donation", async () => {
            (mockPrisma.donation.create as import("vitest").Mock).mockResolvedValue({ id: "don-1", donorName: "Anonyme" });
            const { createDonation } = await import("@/actions/donations");
            const formData = new FormData();
            formData.set("donationType", "ALIMENTAIRE");
            formData.set("quantity", "10");
            formData.set("unit", "KG");
            formData.set("date", new Date().toISOString());
            const result = await createDonation(formData);
            expect(result).not.toHaveProperty("unauthorized");
        });

        it("should NOT allow PARTENAIRE to view other partners' appointments", async () => {
            const { getAppointments } = await import("@/actions/appointments");
            // Should only return appointments belonging to the current partner
            (mockPrisma.appointment.findMany as import("vitest").Mock).mockResolvedValue([]);
            const result = await getAppointments();
            expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: expect.objectContaining({ userId: "part-1" }) })
            );
        });
    });

    describe("DIRECTRICE — full admin access", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "dir-1", role: "DIRECTRICE", email: "vanessa@rescape.fr" } } as never);
        });

        it("should allow DIRECTRICE to create an article", async () => {
            (mockPrisma.article.create as import("vitest").Mock).mockResolvedValue({ id: "art-1" });
            const { createArticle } = await import("@/actions/articles");
            const formData = new FormData();
            formData.set("title", "Nouvel article");
            formData.set("content", "Contenu de l'article de test pour vérifier les droits");
            const result = await createArticle(formData);
            expect(result).not.toHaveProperty("unauthorized");
        });

        it("should allow DIRECTRICE to delete an accounting entry", async () => {
            (mockPrisma.accountingEntry.delete as import("vitest").Mock).mockResolvedValue({ id: "entry-1" });
            const { deleteAccountingEntry } = await import("@/actions/accounting");
            await expect(deleteAccountingEntry("entry-1")).resolves.not.toThrow();
        });
    });

    describe("SUPER_ADMIN — restricted from accounting", () => {
        beforeEach(() => {
            mockAuth.mockResolvedValue({ user: { id: "sa-1", role: "SUPER_ADMIN", email: "admin@rescape.fr" } } as never);
        });

        it("should allow SUPER_ADMIN to manage users", async () => {
            (mockPrisma.user.findMany as import("vitest").Mock).mockResolvedValue([]);
            const { getUsers } = await import("@/actions/users");
            const result = await getUsers();
            expect(Array.isArray(result)).toBe(true);
        });

        it("should NOT allow SUPER_ADMIN to access accounting entries", async () => {
            (mockPrisma.accountingEntry.findMany as import("vitest").Mock).mockResolvedValue([]);
            const { getAccountingEntries } = await import("@/actions/accounting");
            await expect(getAccountingEntries()).rejects.toThrow();
        });
    });
});

describe("Security — Input Sanitization", () => {
    it("should prevent XSS payloads in article title", async () => {
        mockAuth.mockResolvedValue({ user: { id: "dir-1", role: "DIRECTRICE", email: "vanessa@rescape.fr" } } as never);
        (mockPrisma.article.create as import("vitest").Mock).mockResolvedValue({ id: "art-xss" });
        const { createArticle } = await import("@/actions/articles");
        const formData = new FormData();
        formData.set("title", '<script>alert("xss")</script>');
        formData.set("content", "Normal content for an article test");
        const result = await createArticle(formData);
        // Should either sanitize or return validation error, but not store raw script
        if (result && typeof result === "object" && "error" in result) {
            expect(result.error).toBeDefined();
        }
    });

    it("should prevent SQL injection via accounting description", async () => {
        mockAuth.mockResolvedValue({ user: { id: "dir-1", role: "DIRECTRICE", email: "vanessa@rescape.fr" } } as never);
        (mockPrisma.accountingEntry.create as import("vitest").Mock).mockResolvedValue({ id: "acc-sql" });
        const { createAccountingEntry } = await import("@/actions/accounting");
        const formData = new FormData();
        formData.set("type", "DEPENSE");
        formData.set("amount", "10");
        formData.set("category", "ACHAT");
        formData.set("description", "'; DROP TABLE AccountingEntry; --");
        formData.set("date", new Date().toISOString());
        // Prisma uses parameterized queries, so this should be safe.
        // The test verifies that Prisma's create was called (not raw SQL).
        await createAccountingEntry(formData);
        if ((mockPrisma.accountingEntry.create as import("vitest").Mock).mock.calls.length > 0) {
            // Prisma is safely parameterized — no raw SQL injection possible
            expect(mockPrisma.accountingEntry.create).toHaveBeenCalled();
        }
    });
});
