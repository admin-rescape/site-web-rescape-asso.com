import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function adminSession(role = "DIRECTRICE") {
    return { user: { id: "u-1", role, email: "admin@rescape-asso.com" } } as never;
}

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
}

describe("actions/actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("getActions", () => {
        it("returns all actions ordered by createdAt desc", async () => {
            (mockPrisma.action.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "act1" }]);
            const { getActions } = await import("@/actions/actions");
            const result = await getActions();
            expect(result).toHaveLength(1);
            expect(mockPrisma.action.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
        });
    });

    describe("getActiveActions", () => {
        it("returns only active actions", async () => {
            (mockPrisma.action.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            const { getActiveActions } = await import("@/actions/actions");
            await getActiveActions();
            expect(mockPrisma.action.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { createdAt: "asc" },
            });
        });
    });

    describe("createAction", () => {
        it("returns error when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createAction } = await import("@/actions/actions");
            const result = await createAction(makeFormData({}));
            expect(result).toEqual({ error: "Non autorisé" });
        });

        it("returns error when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { createAction } = await import("@/actions/actions");
            const result = await createAction(makeFormData({}));
            expect(result).toEqual({ error: "Non autorisé" });
        });

        it("returns validation error for invalid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createAction } = await import("@/actions/actions");
            const result = await createAction(makeFormData({ title: "AB" }));
            expect(result?.error).toContain("Données invalides");
        });

        it("creates action on valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.action.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "a1" });
            const { createAction } = await import("@/actions/actions");
            const result = await createAction(makeFormData({
                title: "Action Test",
                description: "Description assez longue pour être valide",
                icon: "🎉",
                status: "En cours",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.action.create).toHaveBeenCalled();
        });
    });

    describe("deleteAction", () => {
        it("returns error when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deleteAction } = await import("@/actions/actions");
            const result = await deleteAction("a-1");
            expect(result).toEqual({ error: "Non autorisé" });
        });

        it("deletes action for admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.action.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteAction } = await import("@/actions/actions");
            const result = await deleteAction("a-1");
            expect(result).toEqual({ success: true });
        });

        it("returns error on DB failure", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.action.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { deleteAction } = await import("@/actions/actions");
            const result = await deleteAction("a-1");
            expect(result).toEqual({ error: "Erreur lors de la suppression." });
        });
    });

    describe("updateAction", () => {
        it("updates action for admin with valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.action.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { updateAction } = await import("@/actions/actions");
            const result = await updateAction("a1", makeFormData({
                title: "Mis à jour",
                description: "Description mise à jour et assez longue",
                icon: "✅",
                status: "Terminé",
            }));
            expect(result).toEqual({ success: true });
        });
    });
});
