"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/roles";
import { sendContactNotification, sendContactConfirmation } from "@/lib/mailer";
import { contactSchema } from "@/lib/validations/contact";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Fonction de sanitisation simple pour éviter les injections HTML/PHP
 */
function sanitize(str: string) {
    if (!str) return "";
    return str
        .replace(/<[^>]*>?/gm, "") // Supprime les balises HTML
        .replace(/<\?php[\s\S]*?\?>/gi, "") // Supprime les balises PHP
        .trim();
}

export async function createMessage(formData: FormData) {
    // Rate limit: 5 submissions per 10 minutes per IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!rateLimit(`contact:${ip}`, { limit: 5, windowSec: 600 })) {
        return { error: "Trop de messages envoyés. Réessayez dans 10 minutes." };
    }

    const rawPhone = formData.get("phone") as string;
    // Nettoyage spécifique pour le téléphone (uniquement garder les chiffres)
    const sanitizedPhone = rawPhone ? rawPhone.replace(/[\s.]/g, "") : "";

    const rawData = {
        name: sanitize(formData.get("name") as string),
        email: sanitize(formData.get("email") as string),
        phone: sanitizedPhone,
        subject: sanitize(formData.get("subject") as string),
        content: sanitize(formData.get("content") as string),
        rgpd: formData.get("rgpd") === "on", // FormData envoie "on" pour une checkbox cochée
    };

    const validatedData = contactSchema.safeParse(rawData);

    if (!validatedData.success) {
        // Retourne les erreurs formatées par champ
        const fieldErrors = validatedData.error.flatten().fieldErrors;
        return {
            error: "Formulaire invalide",
            details: fieldErrors
        };
    }

    try {
        await prisma.message.create({
            data: {
                name: validatedData.data.name,
                email: validatedData.data.email,
                phone: validatedData.data.phone || null,
                subject: validatedData.data.subject,
                content: validatedData.data.content,
            },
        });

        // Envoi asynchrone des emails (non bloquant — erreur silencieuse en prod)
        Promise.all([
            sendContactNotification({
                name: validatedData.data.name,
                email: validatedData.data.email,
                phone: validatedData.data.phone,
                subject: validatedData.data.subject,
                content: validatedData.data.content,
            }),
            sendContactConfirmation(validatedData.data.name, validatedData.data.email),
        ]).catch((err) => console.error("[mailer] Erreur envoi email:", err));

        return { success: true };
    } catch (error) {
        console.error("Create message error:", error);
        return { error: "Une erreur est survenue lors de l'envoi." };
    }
}

export async function deleteMessage(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    try {
        await prisma.message.delete({ where: { id } });
        revalidatePath("/admin/dashboard/messages");
        return { success: true };
    } catch (error) {
        console.error("Delete message error:", error);
        return { error: "Erreur lors de la suppression" };
    }
}
