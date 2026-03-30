import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function adminSession(role = "DIRECTRICE") {
    return { user: { id: "u-1", role, email: "admin@rescape.fr" } } as never;
}

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
}

describe("actions/partners", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("getHighlightedPartners", () => {
        it("returns highlighted partners", async () => {
            (mockPrisma.partner.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "p1", isHighlighted: true }]);
            const { getHighlightedPartners } = await import("@/actions/partners");
            const result = await getHighlightedPartners();
            expect(mockPrisma.partner.findMany).toHaveBeenCalledWith({
                where: { isHighlighted: true },
                orderBy: { name: "asc" },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe("createPartner", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createPartner } = await import("@/actions/partners");
            await expect(createPartner(makeFormData({ name: "Test" }))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { createPartner } = await import("@/actions/partners");
            await expect(createPartner(makeFormData({ name: "Test" }))).rejects.toThrow("Non autorisé");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createPartner } = await import("@/actions/partners");
            const result = await createPartner(makeFormData({ name: "A" })); // too short
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates and redirects on valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.partner.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "p1" });
            const { createPartner } = await import("@/actions/partners");
            await createPartner(makeFormData({ name: "Partenaire Test", link: "", logo: "" }));
            expect(mockPrisma.partner.create).toHaveBeenCalled();
        });
    });

    describe("deletePartner", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deletePartner } = await import("@/actions/partners");
            await expect(deletePartner("p-1")).rejects.toThrow("Non autorisé");
        });

        it("deletes when admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.partner.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deletePartner } = await import("@/actions/partners");
            await deletePartner("p-1");
            expect(mockPrisma.partner.delete).toHaveBeenCalledWith({ where: { id: "p-1" } });
        });
    });

    describe("updatePartner", () => {
        it("throws when PARTENAIRE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "p-1", role: "PARTENAIRE" } } as never);
            const { updatePartner } = await import("@/actions/partners");
            await expect(
                updatePartner(makeFormData({ id: "p1", name: "Update" }))
            ).rejects.toThrow("Action non autorisée");
        });

        it("returns error when missing id or name", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { updatePartner } = await import("@/actions/partners");
            const result = await updatePartner(makeFormData({ id: "", name: "" }));
            expect(result).toEqual({ error: "Données invalides" });
        });
    });
});
