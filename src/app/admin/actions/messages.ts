"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function checkAuth() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    return session;
}

export async function sendInternalMessage(formData: FormData) {
    const session = await checkAuth();

    const toUserId = formData.get("toUserId") as string;
    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;

    if (!toUserId || !subject || !content) throw new Error("Tous les champs sont requis.");

    const fromUserId = session.user!.id as string;
    if (!fromUserId) throw new Error("Erreur de session : ID expéditeur manquant.");

    if (toUserId === fromUserId) throw new Error("Vous ne pouvez pas vous envoyer un message.");
    if (subject.length > 200) throw new Error("L'objet ne peut pas dépasser 200 caractères.");
    if (content.length > 5000) throw new Error("Le message ne peut pas dépasser 5000 caractères.");

    const safeSubject = subject.replace(/<[^>]*>/g, "").trim();
    const safeContent = content.replace(/<[^>]*>/g, "").trim();

    await prisma.internalMessage.create({
        data: {
            fromUserId,
            toUserId,
            subject: safeSubject,
            content: safeContent,
        }
    });

    revalidatePath("/admin/dashboard/messagerie");
    return { success: true };
}

export async function markAsRead(id: string) {
    const session = await checkAuth();
    const userId = session.user!.id as string;

    // Single atomic query: ownership check is embedded in the `where` clause,
    // eliminating a findUnique round-trip and preventing a TOCTOU race condition.
    const { count } = await prisma.internalMessage.updateMany({
        where: { id, toUserId: userId },
        data: { isRead: true },
    });

    if (count === 0) throw new Error("Unauthorized");

    revalidatePath("/admin/dashboard/messagerie");
    return { success: true };
}
