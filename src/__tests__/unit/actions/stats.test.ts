import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

const mockPrisma = vi.mocked(prisma);

describe("actions/stats — getStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns aggregated statistics from the database", async () => {
        (mockPrisma.event.count as ReturnType<typeof vi.fn>).mockResolvedValue(10);
        (mockPrisma.partner.count as ReturnType<typeof vi.fn>).mockResolvedValue(5);
        (mockPrisma.user.count as ReturnType<typeof vi.fn>).mockResolvedValue(20);
        (mockPrisma.donation.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { quantity: 1500.5 } });

        const { getStats } = await import("@/actions/stats");
        const result = await getStats();

        expect(result).toHaveLength(4);
        expect(result[0]).toEqual({ label: "Bénévoles Engagés", value: 20, suffix: "" });
        expect(result[1]).toEqual({ label: "Partenaires", value: 5, suffix: "" });
        expect(result[2]).toEqual({ label: "Kilos Redistribués", value: 1501, suffix: " kg" });
        expect(result[3]).toEqual({ label: "Événements Organisés", value: 10, suffix: "" });
    });

    it("returns fallback zeros on database error", async () => {
        (mockPrisma.event.count as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB down"));

        const { getStats } = await import("@/actions/stats");
        const result = await getStats();

        expect(result).toHaveLength(4);
        expect(result.every((s) => s.value === 0)).toBe(true);
    });

    it("handles null donation aggregate sum", async () => {
        (mockPrisma.event.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
        (mockPrisma.partner.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
        (mockPrisma.user.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
        (mockPrisma.donation.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _sum: { quantity: null } });

        const { getStats } = await import("@/actions/stats");
        const result = await getStats();

        expect(result[2].value).toBe(0);
    });
});
