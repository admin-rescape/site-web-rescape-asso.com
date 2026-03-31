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

describe("actions/missions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createMission", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createMission } = await import("@/actions/missions");
            await expect(createMission(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { createMission } = await import("@/actions/missions");
            await expect(createMission(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("throws when PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("PARTENAIRE"));
            const { createMission } = await import("@/actions/missions");
            await expect(createMission(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("returns error when fields are missing", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createMission } = await import("@/actions/missions");
            const result = await createMission(makeFormData({ title: "Test" })); // missing date and assigneeId
            expect(result).toEqual({ error: "Veuillez remplir les champs obligatoires (Titre, Date, Assigné à)." });
        });

        it("returns error when assignee is not BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ role: "PARTENAIRE" });
            const { createMission } = await import("@/actions/missions");
            const result = await createMission(makeFormData({
                title: "Mission", date: "2025-06-01", assigneeId: "p-1",
            }));
            expect(result).toEqual({ error: "Une mission ne peut être assignée qu'à un bénévole." });
        });

        it("creates mission when valid", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ role: "BENEVOLE" });
            (mockPrisma.mission.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "m1" });
            const { createMission } = await import("@/actions/missions");
            const result = await createMission(makeFormData({
                title: "Tri alimentaire",
                description: "Trier les aliments reçus",
                date: "2025-06-15",
                assigneeId: "benevole-1",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.mission.create).toHaveBeenCalled();
        });

        it("allows SUPER_ADMIN to create mission", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ role: "BENEVOLE" });
            (mockPrisma.mission.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "m2" });
            const { createMission } = await import("@/actions/missions");
            const result = await createMission(makeFormData({
                title: "Mission SA", date: "2025-07-01", assigneeId: "b-1",
            }));
            expect(result).toEqual({ success: true });
        });
    });

    describe("getMissionsForDirection", () => {
        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { getMissionsForDirection } = await import("@/actions/missions");
            await expect(getMissionsForDirection()).rejects.toThrow("Action non autorisée");
        });

        it("returns missions for DIRECTRICE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.mission.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "m1" }]);
            const { getMissionsForDirection } = await import("@/actions/missions");
            const result = await getMissionsForDirection();
            expect(result).toHaveLength(1);
        });
    });

    describe("getMyMissions", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getMyMissions } = await import("@/actions/missions");
            await expect(getMyMissions()).rejects.toThrow("Non autorisé");
        });

        it("returns own missions for any authenticated user", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE", "b-1"));
            (mockPrisma.mission.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "m1", assigneeId: "b-1" }]);
            const { getMyMissions } = await import("@/actions/missions");
            const result = await getMyMissions();
            expect(mockPrisma.mission.findMany).toHaveBeenCalledWith({
                where: { assigneeId: "b-1" },
                orderBy: { date: "asc" },
            });
            expect(result).toHaveLength(1);
        });
    });

    describe("updateMissionStatus", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { updateMissionStatus } = await import("@/actions/missions");
            await expect(updateMissionStatus("m1", "EN_COURS")).rejects.toThrow("Non autorisé");
        });

        it("throws for non-owner non-direction", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE", "other-b"));
            (mockPrisma.mission.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ assigneeId: "b-1" });
            const { updateMissionStatus } = await import("@/actions/missions");
            await expect(updateMissionStatus("m1", "EN_COURS")).rejects.toThrow("Action non autorisée");
        });

        it("throws for invalid status", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE", "b-1"));
            (mockPrisma.mission.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ assigneeId: "b-1" });
            const { updateMissionStatus } = await import("@/actions/missions");
            await expect(updateMissionStatus("m1", "INVALID")).rejects.toThrow("Statut invalide");
        });

        it("allows owner to update status", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE", "b-1"));
            (mockPrisma.mission.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ assigneeId: "b-1" });
            (mockPrisma.mission.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { updateMissionStatus } = await import("@/actions/missions");
            const result = await updateMissionStatus("m1", "TERMINEE");
            expect(result).toEqual({ success: true });
        });

        it("allows direction to update any mission status", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.mission.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ assigneeId: "b-1" });
            (mockPrisma.mission.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { updateMissionStatus } = await import("@/actions/missions");
            const result = await updateMissionStatus("m1", "ANNULEE");
            expect(result).toEqual({ success: true });
        });
    });

    describe("deleteMission", () => {
        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { deleteMission } = await import("@/actions/missions");
            await expect(deleteMission("m-1")).rejects.toThrow("Action non autorisée");
        });

        it("deletes for DIRECTRICE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.mission.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteMission } = await import("@/actions/missions");
            const result = await deleteMission("m-1");
            expect(result).toEqual({ success: true });
        });
    });
});
