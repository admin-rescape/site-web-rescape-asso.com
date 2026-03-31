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

describe("actions/team", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createTeamMember", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createTeamMember } = await import("@/actions/team");
            await expect(createTeamMember(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { createTeamMember } = await import("@/actions/team");
            await expect(createTeamMember(makeFormData({}))).rejects.toThrow("Action non autorisée");
        });

        it("returns error when name or role missing", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createTeamMember } = await import("@/actions/team");
            const result = await createTeamMember(makeFormData({ name: "Jean" })); // missing role
            expect(result).toEqual({ error: "Le nom et le rôle sont obligatoires." });
        });

        it("creates team member with valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.teamMember.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "tm1" });
            const { createTeamMember } = await import("@/actions/team");
            const result = await createTeamMember(makeFormData({
                name: "Marie Martin",
                role: "Présidente",
                bio: "Fondatrice",
                order: "1",
            }));
            expect(result).toEqual({ success: true });
        });

        it("returns error on DB failure", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.teamMember.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { createTeamMember } = await import("@/actions/team");
            const result = await createTeamMember(makeFormData({
                name: "Test", role: "Membre",
            }));
            expect(result).toEqual({ error: "Erreur lors de la création du membre." });
        });
    });

    describe("updateTeamMember", () => {
        it("throws when PARTENAIRE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "p-1", role: "PARTENAIRE" } } as never);
            const { updateTeamMember } = await import("@/actions/team");
            await expect(updateTeamMember("tm1", makeFormData({ name: "Test", role: "X" }))).rejects.toThrow("Action non autorisée");
        });

        it("updates member for admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.teamMember.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { updateTeamMember } = await import("@/actions/team");
            const result = await updateTeamMember("tm1", makeFormData({
                name: "Updated Name", role: "Vice-Président",
            }));
            expect(result).toEqual({ success: true });
        });
    });

    describe("deleteTeamMember", () => {
        it("deletes for admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.teamMember.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteTeamMember } = await import("@/actions/team");
            const result = await deleteTeamMember("tm-1");
            expect(result).toEqual({ success: true });
        });
    });
});
