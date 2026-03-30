"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { hasAdminAccess } from "@/lib/roles";

const ActionSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    icon: z.string().emoji().or(z.string().min(1)), // quick emoji validation or icon name
    status: z.string().min(3),
});

export async function getActions() {
    return prisma.action.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function getActiveActions() {
    return prisma.action.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
    });
}

export async function createAction(formData: FormData) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        return { error: "Non autorisé" };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        status: formData.get("status"),
    };

    const validatedData = ActionSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: "Données invalides. Vérifiez les champs." };
    }

    try {
        await prisma.action.create({
            data: {
                title: validatedData.data.title,
                description: validatedData.data.description,
                icon: validatedData.data.icon,
                status: validatedData.data.status,
            },
        });
        revalidatePath("/actions");
        return { success: true };
    } catch (error) {
        console.error("Error creating action:", error);
        return { error: "Erreur lors de la création de l'action." };
    }
}

export async function updateAction(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        return { error: "Non autorisé" };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        icon: formData.get("icon"),
        status: formData.get("status"),
    };

    const validatedData = ActionSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: "Données invalides." };
    }

    try {
        await prisma.action.update({
            where: { id },
            data: validatedData.data,
        });
        revalidatePath("/actions");
        return { success: true };
    } catch (error) {
        console.error("Error updating action:", error);
        return { error: "Erreur lors de la mise à jour." };
    }
}

export async function deleteAction(id: string) {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        return { error: "Non autorisé" };
    }

    try {
        await prisma.action.delete({ where: { id } });
        revalidatePath("/actions");
        return { success: true };
    } catch {
        return { error: "Erreur lors de la suppression." };
    }
}
