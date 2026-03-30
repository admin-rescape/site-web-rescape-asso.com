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

describe("actions/messages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createMessage", () => {
        it("returns error for invalid form data", async () => {
            const { createMessage } = await import("@/actions/messages");
            const result = await createMessage(makeFormData({
                name: "A",
                email: "bad-email",
                content: "short",
                rgpd: "on",
            }));
            expect(result).toHaveProperty("error");
        });

        it("creates message and returns success on valid data", async () => {
            (mockPrisma.message.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "m1" });
            const { createMessage } = await import("@/actions/messages");
            const result = await createMessage(makeFormData({
                name: "Jean Dupont",
                email: "jean@example.com",
                phone: "0612345678",
                subject: "Question",
                content: "A".repeat(50), // min 50 chars
                rgpd: "on",
            }));
            expect(result).toEqual({ success: true });
            expect(mockPrisma.message.create).toHaveBeenCalled();
        });

        it("returns error on DB failure", async () => {
            (mockPrisma.message.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { createMessage } = await import("@/actions/messages");
            const result = await createMessage(makeFormData({
                name: "Jean Dupont",
                email: "jean@example.com",
                content: "A".repeat(50),
                rgpd: "on",
            }));
            expect(result).toEqual({ error: "Une erreur est survenue lors de l'envoi." });
        });
    });

    describe("deleteMessage", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deleteMessage } = await import("@/actions/messages");
            await expect(deleteMessage("m-1")).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { deleteMessage } = await import("@/actions/messages");
            await expect(deleteMessage("m-1")).rejects.toThrow("Action non autorisée");
        });

        it("deletes message when admin", async () => {
            mockAuth.mockResolvedValue({ user: { id: "u-1", role: "DIRECTRICE" } } as never);
            (mockPrisma.message.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteMessage } = await import("@/actions/messages");
            const result = await deleteMessage("m-1");
            expect(result).toEqual({ success: true });
            expect(mockPrisma.message.delete).toHaveBeenCalledWith({ where: { id: "m-1" } });
        });
    });
});
