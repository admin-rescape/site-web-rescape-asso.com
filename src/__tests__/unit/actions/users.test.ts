import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function session(role: string, id = "u-1") {
    return { user: { id, role, email: `${id}@rescape.fr` } } as never;
}

describe("actions/users", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("getUsers", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { getUsers } = await import("@/actions/users");
            await expect(getUsers()).rejects.toThrow("Action non autorisée");
        });

        it("throws when TRESORIERE (cannot manage users)", async () => {
            mockAuth.mockResolvedValue(session("TRESORIERE"));
            const { getUsers } = await import("@/actions/users");
            await expect(getUsers()).rejects.toThrow("Action non autorisée");
        });

        it("returns users for DIRECTRICE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "u1" }]);
            const { getUsers } = await import("@/actions/users");
            const result = await getUsers();
            expect(result).toHaveLength(1);
        });
    });

    describe("createUser", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createUser } = await import("@/actions/users");
            await expect(createUser({ name: "A", email: "a@b.fr", role: "BENEVOLE", password: "12345678" })).rejects.toThrow("Action non autorisée");
        });

        it("throws when non-SUPER_ADMIN tries to create SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createUser } = await import("@/actions/users");
            await expect(
                createUser({ name: "SA", email: "sa@r.fr", role: "SUPER_ADMIN", password: "12345678" })
            ).rejects.toThrow("Seul un administrateur système");
        });

        it("throws for invalid role", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createUser } = await import("@/actions/users");
            await expect(
                createUser({ name: "U", email: "u@r.fr", role: "INVALID_ROLE", password: "12345678" })
            ).rejects.toThrow("Rôle invalide");
        });

        it("throws for short password", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createUser } = await import("@/actions/users");
            await expect(
                createUser({ name: "U", email: "u@r.fr", role: "BENEVOLE", password: "123" })
            ).rejects.toThrow("mot de passe");
        });

        it("creates user and auto-creates partner for PARTENAIRE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const createdUser = { id: "new-1", name: "Part", email: "p@r.fr", role: "PARTENAIRE", organizationName: "Org" };
            (mockPrisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(createdUser);
            (mockPrisma.partner.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { createUser } = await import("@/actions/users");
            const result = await createUser({ name: "Part", email: "p@r.fr", role: "PARTENAIRE", organizationName: "Org", password: "12345678" });
            expect(result.role).toBe("PARTENAIRE");
            expect(mockPrisma.partner.create).toHaveBeenCalledWith({
                data: { name: "Org", userId: "new-1" },
            });
        });

        it("creates BENEVOLE without partner record", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-2", role: "BENEVOLE" });
            const { createUser } = await import("@/actions/users");
            await createUser({ name: "Ben", email: "b@r.fr", role: "BENEVOLE", password: "12345678" });
            expect(mockPrisma.partner.create).not.toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {
        it("prevents self-deletion", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN", "me-1"));
            const { deleteUser } = await import("@/actions/users");
            await expect(deleteUser("me-1")).rejects.toThrow("supprimer votre propre compte");
        });

        it("prevents non-SUPER_ADMIN from deleting SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "sa-1", role: "SUPER_ADMIN" });
            const { deleteUser } = await import("@/actions/users");
            await expect(deleteUser("sa-1")).rejects.toThrow("immuable et protégé");
        });

        it("deletes user successfully", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN", "me-1"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u-2", role: "BENEVOLE" });
            (mockPrisma.user.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteUser } = await import("@/actions/users");
            const result = await deleteUser("u-2");
            expect(result).toEqual({ success: true });
        });
    });

    describe("changeMyPassword", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { changeMyPassword } = await import("@/actions/users");
            await expect(changeMyPassword("old", "newpassword")).rejects.toThrow("Non autorisé");
        });

        it("returns error for short new password", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { changeMyPassword } = await import("@/actions/users");
            const result = await changeMyPassword("old", "short");
            expect(result).toEqual({ error: "Le nouveau mot de passe doit faire au moins 8 caractères" });
        });

        it("returns error for wrong current password", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u-1", password: "hashed_wrongpassword" });
            const { changeMyPassword } = await import("@/actions/users");
            const result = await changeMyPassword("oldpassword", "newpassword123");
            expect(result).toEqual({ error: "Mot de passe actuel incorrect" });
        });

        it("changes password successfully", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            (mockPrisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "u-1", password: "hashed_correctpass" });
            (mockPrisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { changeMyPassword } = await import("@/actions/users");
            const result = await changeMyPassword("correctpass", "newpassword123");
            expect(result).toEqual({ success: true });
            expect(mockPrisma.user.update).toHaveBeenCalled();
        });
    });
});
