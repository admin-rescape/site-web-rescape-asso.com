"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/roles";

export async function createTeamMember(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) throw new Error("Action non autorisée");

    const name = formData.get("name") as string;
    const memberRole = formData.get("role") as string;
    const photo = (formData.get("photo") as string) || null;
    const bio = (formData.get("bio") as string) || null;
    const order = parseInt(formData.get("order") as string, 10) || 0;

    if (!name || !memberRole) {
        return { error: "Le nom et le rôle sont obligatoires." };
    }

    try {
        await prisma.teamMember.create({
            data: { name, role: memberRole, photo, bio, order },
        });
    } catch {
        return { error: "Erreur lors de la création du membre." };
    }

    revalidatePath("/admin/dashboard/team");
    revalidatePath("/notre-histoire");
    return { success: true };
}

export async function updateTeamMember(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) throw new Error("Action non autorisée");

    const name = formData.get("name") as string;
    const memberRole = formData.get("role") as string;
    const photo = (formData.get("photo") as string) || null;
    const bio = (formData.get("bio") as string) || null;
    const order = parseInt(formData.get("order") as string, 10) || 0;

    if (!name || !memberRole) {
        return { error: "Le nom et le rôle sont obligatoires." };
    }

    try {
        await prisma.teamMember.update({
            where: { id },
            data: { name, role: memberRole, photo, bio, order },
        });
    } catch {
        return { error: "Erreur lors de la mise à jour du membre." };
    }

    revalidatePath("/admin/dashboard/team");
    revalidatePath("/notre-histoire");
    return { success: true };
}

export async function deleteTeamMember(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) throw new Error("Action non autorisée");

    try {
        await prisma.teamMember.delete({ where: { id } });
    } catch {
        return { error: "Erreur lors de la suppression du membre." };
    }

    revalidatePath("/admin/dashboard/team");
    revalidatePath("/notre-histoire");
    return { success: true };
}
