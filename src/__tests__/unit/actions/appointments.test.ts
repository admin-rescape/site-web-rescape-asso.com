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

describe("actions/appointments", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createAppointment", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createAppointment } = await import("@/actions/appointments");
            await expect(createAppointment(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { createAppointment } = await import("@/actions/appointments");
            await expect(createAppointment(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createAppointment } = await import("@/actions/appointments");
            const result = await createAppointment(makeFormData({ type: "INVALID" }));
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates appointment as admin", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.appointment.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "apt1" });
            const { createAppointment } = await import("@/actions/appointments");
            const result = await createAppointment(makeFormData({
                type: "DEPOT",
                date: "2025-06-15",
                notes: "",
            }));
            expect(result).toEqual({ success: true });
        });

        it("creates appointment as PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE", "p-1"));
            (mockPrisma.appointment.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "apt2" });
            const { createAppointment } = await import("@/actions/appointments");
            const result = await createAppointment(makeFormData({
                type: "COLLECTE",
                date: "2025-06-20",
            }));
            expect(result).toEqual({ success: true });
            const createCall = (mockPrisma.appointment.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
            expect(createCall.data.userId).toBe("p-1");
        });
    });

    describe("getAppointments", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getAppointments } = await import("@/actions/appointments");
            await expect(getAppointments()).rejects.toThrow("Non autorisé");
        });

        it("returns all appointments for admin", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "a1" }]);
            const { getAppointments } = await import("@/actions/appointments");
            const result = await getAppointments();
            expect(result).toHaveLength(1);
        });

        it("returns only own appointments for PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE", "p-1"));
            (mockPrisma.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            const { getAppointments } = await import("@/actions/appointments");
            await getAppointments();
            expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: "p-1" },
            }));
        });

        it("throws for BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { getAppointments } = await import("@/actions/appointments");
            await expect(getAppointments()).rejects.toThrow("Action non autorisée");
        });
    });
});
