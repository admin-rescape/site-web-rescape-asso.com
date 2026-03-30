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

describe("actions/timeline", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createTimelineEntry", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createTimelineEntry } = await import("@/actions/timeline");
            await expect(createTimelineEntry(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { createTimelineEntry } = await import("@/actions/timeline");
            await expect(createTimelineEntry(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("returns error for missing fields", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createTimelineEntry } = await import("@/actions/timeline");
            const result = await createTimelineEntry(makeFormData({ title: "Test" })); // missing icon, content, order
            expect(result).toEqual({ error: "Veuillez remplir tous les champs obligatoires." });
        });

        it("creates entry with valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.timelineEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "t1" });
            const { createTimelineEntry } = await import("@/actions/timeline");
            const result = await createTimelineEntry(makeFormData({
                title: "Fondation",
                caption: "2020",
                icon: "🏛️",
                content: "L'association est fondée",
                order: "1",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.timelineEntry.create).toHaveBeenCalled();
        });

        it("returns error on DB failure", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.timelineEntry.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { createTimelineEntry } = await import("@/actions/timeline");
            const result = await createTimelineEntry(makeFormData({
                title: "Test", icon: "🎉", content: "Content", order: "1",
            }));
            expect(result).toEqual({ error: "Erreur lors de la création de la période." });
        });
    });

    describe("updateTimelineEntry", () => {
        it("updates entry with valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.timelineEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { updateTimelineEntry } = await import("@/actions/timeline");
            const result = await updateTimelineEntry("t1", makeFormData({
                title: "Updated", icon: "✅", content: "Updated content", order: "2",
            }));
            expect(result).toEqual({ success: true });
        });
    });

    describe("deleteTimelineEntry", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deleteTimelineEntry } = await import("@/actions/timeline");
            await expect(deleteTimelineEntry("t-1")).rejects.toThrow("Non autorisé");
        });

        it("deletes entry for admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.timelineEntry.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteTimelineEntry } = await import("@/actions/timeline");
            const result = await deleteTimelineEntry("t-1");
            expect(result).toEqual({ success: true });
        });
    });
});
