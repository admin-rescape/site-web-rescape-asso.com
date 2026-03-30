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

describe("actions/articles", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("createArticle", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { createArticle } = await import("@/actions/articles");
            await expect(createArticle(makeFormData({}))).rejects.toThrow("Non autorisé");
        });

        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue({ user: { id: "b-1", role: "BENEVOLE" } } as never);
            const { createArticle } = await import("@/actions/articles");
            await expect(
                createArticle(makeFormData({ title: "Test", content: "Contenu assez long pour passer" }))
            ).rejects.toThrow("Action non autorisée");
        });

        it("returns error for invalid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            const { createArticle } = await import("@/actions/articles");
            const result = await createArticle(makeFormData({ title: "AB", content: "short" }));
            expect(result).toEqual({ error: "Données invalides" });
        });

        it("creates article on valid data", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.article.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "a1" });
            const { createArticle } = await import("@/actions/articles");
            await createArticle(makeFormData({
                title: "Mon Article",
                content: "Ceci est un contenu assez long pour être valide",
                excerpt: "",
                image: "",
            }));
            expect(mockPrisma.article.create).toHaveBeenCalled();
        });
    });

    describe("deleteArticle", () => {
        it("throws when unauthenticated", async () => {
            mockAuth.mockResolvedValue(null as never);
            const { deleteArticle } = await import("@/actions/articles");
            await expect(deleteArticle("a-1")).rejects.toThrow("Non autorisé");
        });

        it("deletes and revalidates when admin", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.article.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteArticle } = await import("@/actions/articles");
            await deleteArticle("a-1");
            expect(mockPrisma.article.delete).toHaveBeenCalledWith({ where: { id: "a-1" } });
        });

        it("returns error on DB failure", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.article.delete as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { deleteArticle } = await import("@/actions/articles");
            const result = await deleteArticle("a-1");
            expect(result).toEqual({ error: "Erreur lors de la suppression" });
        });
    });

    describe("toggleArticleStatus", () => {
        it("toggles published → unpublished", async () => {
            mockAuth.mockResolvedValue(adminSession());
            (mockPrisma.article.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { toggleArticleStatus } = await import("@/actions/articles");
            await toggleArticleStatus("a1", true);
            expect(mockPrisma.article.update).toHaveBeenCalledWith({
                where: { id: "a1" },
                data: { published: false, publishedAt: null },
            });
        });
    });

    describe("getLatestArticles", () => {
        it("returns published articles", async () => {
            (mockPrisma.article.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "a1" }]);
            const { getLatestArticles } = await import("@/actions/articles");
            const result = await getLatestArticles();
            expect(result).toHaveLength(1);
            expect(mockPrisma.article.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { published: true },
                take: 3,
            }));
        });

        it("returns empty on error", async () => {
            (mockPrisma.article.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
            const { getLatestArticles } = await import("@/actions/articles");
            const result = await getLatestArticles();
            expect(result).toEqual([]);
        });
    });
});
