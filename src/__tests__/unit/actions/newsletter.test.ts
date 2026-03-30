import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.set(k, v);
    return fd;
}

describe("actions/newsletter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("subscribeNewsletter", () => {
        it("returns error for invalid email", async () => {
            const { subscribeNewsletter } = await import("@/actions/newsletter");
            const result = await subscribeNewsletter(makeFormData({ email: "bad-email" }));
            expect(result).toHaveProperty("error");
        });

        it("upserts on valid email", async () => {
            (mockPrisma.newsletter.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ email: "test@ex.com" });
            const { subscribeNewsletter } = await import("@/actions/newsletter");
            const result = await subscribeNewsletter(makeFormData({ email: "test@ex.com" }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.newsletter.upsert).toHaveBeenCalledWith({
                where: { email: "test@ex.com" },
                update: { active: true },
                create: { email: "test@ex.com" },
            });
        });

        it("returns error on DB failure", async () => {
            (mockPrisma.newsletter.upsert as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { subscribeNewsletter } = await import("@/actions/newsletter");
            const result = await subscribeNewsletter(makeFormData({ email: "test@ex.com" }));
            expect(result?.error).toContain("erreur");
        });
    });

    describe("unsubscribeNewsletter", () => {
        it("deactivates subscription", async () => {
            (mockPrisma.newsletter.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { unsubscribeNewsletter } = await import("@/actions/newsletter");
            const result = await unsubscribeNewsletter("user@ex.com");
            expect(result).toEqual({ success: true });
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email: "user@ex.com" },
                data: { active: false },
            });
        });

        it("returns error on failure", async () => {
            (mockPrisma.newsletter.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("not found"));
            const { unsubscribeNewsletter } = await import("@/actions/newsletter");
            const result = await unsubscribeNewsletter("nonexistent@ex.com");
            expect(result).toEqual({ error: "Erreur lors de la désinscription." });
        });
    });

    describe("getAllSubscribers", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getAllSubscribers } = await import("@/actions/newsletter");
            await expect(getAllSubscribers()).rejects.toThrow("Unauthorized");
        });

        it("throws when BENEVOLE (not direction)", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { getAllSubscribers } = await import("@/actions/newsletter");
            await expect(getAllSubscribers()).rejects.toThrow("Unauthorized");
        });

        it("throws when SUPER_ADMIN (not direction role)", async () => {
            mockAuth.mockResolvedValue({ user: { id: "sa-1", role: "SUPER_ADMIN" } } as never);
            const { getAllSubscribers } = await import("@/actions/newsletter");
            await expect(getAllSubscribers()).rejects.toThrow("Unauthorized");
        });

        it("returns subscribers for DIRECTRICE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "d-1", role: "DIRECTRICE" } } as never);
            (mockPrisma.newsletter.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ email: "a@b.com" }]);
            const { getAllSubscribers } = await import("@/actions/newsletter");
            const result = await getAllSubscribers();
            expect(result).toHaveLength(1);
        });
    });
});
