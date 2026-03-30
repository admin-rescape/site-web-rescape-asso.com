import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function session(role: string) {
    return { user: { id: "u-1", role, email: "admin@rescape.fr" } } as never;
}

describe("actions/calendar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("getGlobalCalendarEvents", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getGlobalCalendarEvents } = await import("@/actions/calendar");
            await expect(getGlobalCalendarEvents()).rejects.toThrow("Action non autorisée");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { getGlobalCalendarEvents } = await import("@/actions/calendar");
            await expect(getGlobalCalendarEvents()).rejects.toThrow("Action non autorisée");
        });

        it("throws when PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE"));
            const { getGlobalCalendarEvents } = await import("@/actions/calendar");
            await expect(getGlobalCalendarEvents()).rejects.toThrow("Action non autorisée");
        });

        it("returns merged events and appointments for admin", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.event.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { id: "e1", title: "Événement 1", start: new Date("2025-06-01"), end: null, location: "Aniche" },
            ]);
            (mockPrisma.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { id: "a1", type: "DEPOT", date: new Date("2025-06-02"), status: "CONFIRMED", user: { name: "Org", organizationName: "Partner Corp" } },
            ]);
            const { getGlobalCalendarEvents } = await import("@/actions/calendar");
            const result = await getGlobalCalendarEvents();
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe("ev_e1");
            expect(result[0].extendedProps.type).toBe("EVENT");
            expect(result[1].id).toBe("apt_a1");
            expect(result[1].extendedProps.type).toBe("APPOINTMENT");
        });

        it("formats appointment colors by status", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.event.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            (mockPrisma.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
                { id: "a1", type: "COLLECTE", date: new Date("2025-06-01"), status: "PENDING", user: { name: "U", organizationName: null } },
                { id: "a2", type: "DEPOT", date: new Date("2025-06-02"), status: "CONFIRMED", user: { name: "V", organizationName: "Org" } },
            ]);
            const { getGlobalCalendarEvents } = await import("@/actions/calendar");
            const result = await getGlobalCalendarEvents();
            // PENDING = orange
            expect(result[0].backgroundColor).toBe("#EA580C");
            // CONFIRMED = emerald
            expect(result[1].backgroundColor).toBe("#059669");
        });
    });
});
