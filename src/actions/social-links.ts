"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isSuperAdmin } from "@/lib/roles";

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user || !isSuperAdmin(session.user.role as string)) {
        throw new Error("Accès refusé : SUPER_ADMIN requis");
    }
    return session;
}

export async function getSocialLinks() {
    return prisma.socialLink.findMany({
        where: { isActive: true },
        orderBy: { platform: "asc" },
    });
}

export async function getAllSocialLinks() {
    await requireSuperAdmin();
    return prisma.socialLink.findMany({
        orderBy: { platform: "asc" },
    });
}

export async function createSocialLink(data: {
    platform: string;
    url: string;
    isActive?: boolean;
}) {
    await requireSuperAdmin();
    const link = await prisma.socialLink.create({
        data: {
            platform: data.platform,
            url: data.url,
            isActive: data.isActive ?? true,
        },
    });
    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/");
    return link;
}

export async function updateSocialLink(
    id: string,
    data: { platform?: string; url?: string; isActive?: boolean }
) {
    await requireSuperAdmin();
    const link = await prisma.socialLink.update({
        where: { id },
        data,
    });
    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/");
    return link;
}

export async function deleteSocialLink(id: string) {
    await requireSuperAdmin();
    await prisma.socialLink.delete({ where: { id } });
    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/");
}
