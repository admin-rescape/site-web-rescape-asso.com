import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const mockPrisma = vi.mocked(prisma);
const mockAuth = vi.mocked(auth);

function session(role: string) {
    return { user: { id: "u-1", role, email: "admin@rescape-asso.com" } } as never;
}

describe("actions/social-links", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe("getSocialLinks (public)", () => {
        it("returns active social links", async () => {
            (mockPrisma.socialLink.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "sl1", platform: "facebook" }]);
            const { getSocialLinks } = await import("@/actions/social-links");
            const result = await getSocialLinks();
            expect(result).toHaveLength(1);
            expect(mockPrisma.socialLink.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { platform: "asc" },
            });
        });
    });

    describe("getAllSocialLinks", () => {
        it("throws when not SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { getAllSocialLinks } = await import("@/actions/social-links");
            await expect(getAllSocialLinks()).rejects.toThrow("SUPER_ADMIN requis");
        });

        it("returns all links for SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.socialLink.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "sl1" }, { id: "sl2" }]);
            const { getAllSocialLinks } = await import("@/actions/social-links");
            const result = await getAllSocialLinks();
            expect(result).toHaveLength(2);
        });
    });

    describe("createSocialLink", () => {
        it("throws when DIRECTRICE", async () => {
            mockAuth.mockResolvedValue(session("DIRECTRICE"));
            const { createSocialLink } = await import("@/actions/social-links");
            await expect(createSocialLink({ platform: "twitter", url: "https://x.com/rescape" })).rejects.toThrow("SUPER_ADMIN requis");
        });

        it("creates link for SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.socialLink.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "sl-new", platform: "instagram" });
            const { createSocialLink } = await import("@/actions/social-links");
            const result = await createSocialLink({ platform: "instagram", url: "https://instagram.com/rescape" });
            expect(result.platform).toBe("instagram");
        });
    });

    describe("updateSocialLink", () => {
        it("throws when BENEVOLE", async () => {
            mockAuth.mockResolvedValue(session("BENEVOLE"));
            const { updateSocialLink } = await import("@/actions/social-links");
            await expect(updateSocialLink("sl1", { url: "https://new-url.com" })).rejects.toThrow("SUPER_ADMIN requis");
        });

        it("updates for SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.socialLink.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "sl1", url: "https://new.com" });
            const { updateSocialLink } = await import("@/actions/social-links");
            const result = await updateSocialLink("sl1", { url: "https://new.com" });
            expect(result.url).toBe("https://new.com");
        });
    });

    describe("deleteSocialLink", () => {
        it("throws when not SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("TRESORIERE"));
            const { deleteSocialLink } = await import("@/actions/social-links");
            await expect(deleteSocialLink("sl-1")).rejects.toThrow("SUPER_ADMIN requis");
        });

        it("deletes for SUPER_ADMIN", async () => {
            mockAuth.mockResolvedValue(session("SUPER_ADMIN"));
            (mockPrisma.socialLink.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
            const { deleteSocialLink } = await import("@/actions/social-links");
            await deleteSocialLink("sl-1");
            expect(mockPrisma.socialLink.delete).toHaveBeenCalledWith({ where: { id: "sl-1" } });
        });
    });
});
