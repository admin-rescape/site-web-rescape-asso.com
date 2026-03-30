import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function session(role: string, id = "u-1") {
    return { user: { id, role, email: `${id}@rescape.fr` } } as never;
}

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
}

describe("actions/donations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createDonation", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createDonation } = await import("@/actions/donations");
            await expect(createDonation(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE (no admin or partner access)", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { createDonation } = await import("@/actions/donations");
            await expect(createDonation(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createDonation } = await import("@/actions/donations");
            const result = await createDonation(makeFormData({ donationType: "INVALID" }));
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates donation as admin", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.donation.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "d1" });
            const { createDonation } = await import("@/actions/donations");
            const result = await createDonation(makeFormData({
                donationType: "ALIMENTAIRE",
                quantity: "10",
                unit: "KG",
                date: "2025-06-01",
                notes: "",
                donorName: "Mairie",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.donation.create).toHaveBeenCalled();
        });

        it("creates donation as PARTENAIRE with userId", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE", "partner-1"));
            (mockPrisma.donation.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "d2" });
            const { createDonation } = await import("@/actions/donations");
            const result = await createDonation(makeFormData({
                donationType: "VETEMENTS",
                quantity: "5",
                unit: "CARTONS",
                date: "2025-06-01",
            }));
            expect(result).toEqual({ success: true });
            // Check that userId is set for partner
            const createCall = (mockPrisma.donation.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(createCall.data.userId).toBe("partner-1");
        });
    });

    describe("getDonations", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getDonations } = await import("@/actions/donations");
            await expect(getDonations()).rejects.toThrow("Non autorisé");
        });

        it("returns all donations for admin", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.donation.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "d1" }, { id: "d2" }]);
            const { getDonations } = await import("@/actions/donations");
            const result = await getDonations();
            expect(result).toHaveLength(2);
        });

        it("returns only own donations for PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE", "p-1"));
            (mockPrisma.donation.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "d1" }]);
            const { getDonations } = await import("@/actions/donations");
            await getDonations();
            expect(mockPrisma.donation.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: "p-1" },
            }));
        });

        it("throws for BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { getDonations } = await import("@/actions/donations");
            await expect(getDonations()).rejects.toThrow("Action non autorisée");
        });
    });
});
