"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isDirectionRole, isSuperAdmin } from "@/lib/roles";

export async function createMission(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!isDirectionRole(role) && !isSuperAdmin(role)) {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        location: formData.get("location") as string,
        date: formData.get("date") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
        assigneeId: formData.get("assigneeId") as string,
    };

    if (!rawData.title || !rawData.date || !rawData.assigneeId) {
        return { error: "Veuillez remplir les champs obligatoires (Titre, Date, Assigné à)." };
    }

    const assignee = await prisma.user.findUnique({
        where: { id: rawData.assigneeId },
        select: { role: true }
    });

    if (!assignee || assignee.role !== "BENEVOLE") {
        return { error: "Une mission ne peut être assignée qu'à un bénévole." };
    }

    try {
        await prisma.mission.create({
            data: {
                title: rawData.title,
                description: rawData.description || "",
                location: rawData.location || null,
                date: new Date(rawData.date),
                startTime: rawData.startTime || null,
                endTime: rawData.endTime || null,
                assigneeId: rawData.assigneeId,
            }
        });
        revalidatePath("/admin/dashboard/missions");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error: unknown) {
        console.error("Erreur lors de la création de la mission:", error);
        return { error: "Une erreur est survenue lors de la création." };
    }
}

export async function getMissionsForDirection() {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!isDirectionRole(role) && !isSuperAdmin(role)) {
        throw new Error("Action non autorisée");
    }

    return await prisma.mission.findMany({
        include: {
            assignee: {
                select: { name: true, email: true }
            }
        },
        orderBy: { date: "asc" }
    });
}

export async function getMyMissions() {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    return await prisma.mission.findMany({
        where: { assigneeId: session.user.id },
        orderBy: { date: "asc" }
    });
}

export async function updateMissionStatus(id: string, newStatus: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const mission = await prisma.mission.findUnique({
        where: { id },
        select: { assigneeId: true }
    });

    if (!mission) throw new Error("Mission introuvable");

    const role = session.user.role as string;
    const isOwner = mission.assigneeId === session.user.id;
    const isDirection = isDirectionRole(role) || isSuperAdmin(role);

    // Seul le bénévole assigné ou la direction peut modifier le statut
    if (!isOwner && !isDirection) {
        throw new Error("Action non autorisée");
    }

    // Validation basique des statuts autorisés
    const validStatuses = ["A_FAIRE", "EN_COURS", "TERMINEE", "ANNULEE"];
    if (!validStatuses.includes(newStatus)) {
        throw new Error("Statut invalide");
    }

    try {
        await prisma.mission.update({
            where: { id },
            data: { status: newStatus }
        });
        revalidatePath("/admin/dashboard/missions");
        return { success: true };
    } catch (error: unknown) {
        console.error("Erreur mise à jour statut mission:", error);
        return { error: "Erreur lors de la mise à jour." };
    }
}

export async function deleteMission(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    // Seule la direction peut supprimer
    if (!isDirectionRole(role) && !isSuperAdmin(role)) {
        throw new Error("Action non autorisée");
    }

    try {
        await prisma.mission.delete({ where: { id } });
        revalidatePath("/admin/dashboard/missions");
        return { success: true };
    } catch (error: unknown) {
        console.error("Erreur suppression mission:", error);
        return { error: "Erreur lors de la suppression." };
    }
}

