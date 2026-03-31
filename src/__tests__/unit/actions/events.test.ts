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

describe("actions/events", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createEvent", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createEvent } = await import("@/actions/events");
            await expect(createEvent(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when role has no admin access", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE", email: "b@r.fr" } } as never);
            const { createEvent } = await import("@/actions/events");
            await expect(createEvent(makeFormData({ title: "Test", start: new Date().toISOString() }))).rejects.toThrow("Action non autorisée");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createEvent } = await import("@/actions/events");
            const result = await createEvent(makeFormData({ title: "Ab", start: "" }));
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates event on valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.event.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "e1" });
            const { createEvent } = await import("@/actions/events");
            await createEvent(makeFormData({ title: "Grand Événement", start: "2025-06-01T10:00:00Z", end: "", location: "", description: "" }));
            expect(mockPrisma.event.create).toHaveBeenCalled();
        });
    });

    describe("deleteEvent", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deleteEvent } = await import("@/actions/events");
            await expect(deleteEvent("evt-1")).rejects.toThrow("Non autorisé");
        });

        it("deletes when admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.event.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteEvent } = await import("@/actions/events");
            await deleteEvent("evt-1");
            expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: "evt-1" } });
        });
    });

    describe("updateEvent", () => {
        it("throws for BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { updateEvent } = await import("@/actions/events");
            await expect(updateEvent("e1", makeFormData({ title: "X", start: "2025-01-01" }))).rejects.toThrow("Action non autorisée");
        });
    });

    describe("getPublicEvents", () => {
        it("returns published events", async () => {
            (mockPrisma.event.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "e1", status: "PUBLISHED" }]);
            const { getPublicEvents } = await import("@/actions/events");
            const result = await getPublicEvents();
            expect(mockPrisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { status: "PUBLISHED" },
            }));
            expect(result).toHaveLength(1);
        });

        it("returns empty array on error", async () => {
            (mockPrisma.event.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));
            const { getPublicEvents } = await import("@/actions/events");
            const result = await getPublicEvents();
            expect(result).toEqual([]);
        });
    });
});
