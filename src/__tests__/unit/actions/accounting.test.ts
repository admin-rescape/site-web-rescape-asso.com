import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function session(role: string, id = "u-1") {
    return { user: { id, role, email: `${id}@rescape-asso.com` } } as never;
}

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
}

describe("actions/accounting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createAccountingEntry", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createAccountingEntry } = await import("@/actions/accounting");
            await expect(createAccountingEntry(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when SUPER_ADMIN (not direction role)", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            const { createAccountingEntry } = await import("@/actions/accounting");
            await expect(createAccountingEntry(makeFormData({}))).rejects.toThrow("Action non autorisée pour ce rôle");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { createAccountingEntry } = await import("@/actions/accounting");
            await expect(createAccountingEntry(makeFormData({}))).rejects.toThrow("Action non autorisée pour ce rôle");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(session("TRESORIERE"));
            const { createAccountingEntry } = await import("@/actions/accounting");
            const result = await createAccountingEntry(makeFormData({ type: "INVALID" }));
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates entry for TRESORIERE with valid data", async () => {
            mockAuth.mockResolvedValue(session("TRESORIERE"));
            (mockPrisma.accountingEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "ae1" });
            const { createAccountingEntry } = await import("@/actions/accounting");
            const result = await createAccountingEntry(makeFormData({
                type: "RECETTE",
                amount: "150.50",
                category: "DON_RECU",
                description: "Don de la mairie",
                date: "2025-06-01",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.accountingEntry.create).toHaveBeenCalled();
        });

        it("creates entry for DIRECTRICE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.accountingEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "ae2" });
            const { createAccountingEntry } = await import("@/actions/accounting");
            const result = await createAccountingEntry(makeFormData({
                type: "DEPENSE",
                amount: "50",
                category: "ACHAT",
                description: "Achat matériel",
                date: "2025-06-01",
            }));
            expect(result).toEqual({ success: true });
        });
    });

    describe("deleteAccountingEntry", () => {
        it("throws when SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            const { deleteAccountingEntry } = await import("@/actions/accounting");
            await expect(deleteAccountingEntry("ae-1")).rejects.toThrow("Action non autorisée pour ce rôle");
        });

        it("deletes for TRESORIERE", async () => {
            mockAuth.mockResolvedValue(session("TRESORIERE"));
            (mockPrisma.accountingEntry.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteAccountingEntry } = await import("@/actions/accounting");
            const result = await deleteAccountingEntry("ae-1");
            expect(result).toEqual({ success: true });
        });
    });

    describe("getAccountingEntries", () => {
        it("throws when SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            const { getAccountingEntries } = await import("@/actions/accounting");
            await expect(getAccountingEntries()).rejects.toThrow("Action non autorisée pour ce rôle");
        });

        it("returns entries for direction role", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.accountingEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "ae1" }]);
            const { getAccountingEntries } = await import("@/actions/accounting");
            const result = await getAccountingEntries();
            expect(result).toHaveLength(1);
        });
    });
});
