"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasAdminAccess } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const PartnerSchema = z.object({
    name: z.string().min(2),
    link: z.string().url().optional().or(z.literal("")),
    logo: z.string().optional(),
});

export async function getHighlightedPartners() {
    return prisma.partner.findMany({
        where: { isHighlighted: true },
        orderBy: { name: "asc" },
    });
}

export async function createPartner(formData: FormData) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        throw new Error("Non autorisé");
    }

    const rawData = {
        name: formData.get("name"),
        link: formData.get("link"),
        logo: formData.get("logo"), // In real app, this would be file upload handling
    };

    const validatedData = PartnerSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: "Données invalides" };
    }

    try {
        await prisma.partner.create({
            data: validatedData.data,
        });
    } catch (error) {
        console.error("Create partner error:", error);
        return { error: "Erreur lors de la création" };
    }

    revalidatePath("/admin/dashboard/partners");
    redirect("/admin/dashboard/partners");
}

export async function deletePartner(id: string) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        throw new Error("Non autorisé");
    }

    try {
        await prisma.partner.delete({ where: { id } });
        revalidatePath("/admin/dashboard/partners");
    } catch (error) {
        console.error("Delete partner error:", error);
        return { error: "Erreur lors de la suppression" };
    }
}

export async function updatePartner(formData: FormData) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        throw new Error("Action non autorisée");
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const link = formData.get("link") as string;
    const logo = formData.get("logo") as string;

    if (!id || !name) {
        return { error: "Données invalides" };
    }

    try {
        await prisma.partner.update({
            where: { id },
            data: {
                name,
                link: link || null,
                logo: logo || null,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du partenaire:", error);
        return { error: "Une erreur est survenue" };
    }

    revalidatePath("/admin/dashboard/partners");
    revalidatePath("/partenaires");
    redirect("/admin/dashboard/partners");
}
