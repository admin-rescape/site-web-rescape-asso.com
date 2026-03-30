"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/roles";
import { z } from "zod";

const EventSchema = z.object({
    title: z.string().min(3),
    start: z.string().transform((str) => new Date(str)),
    end: z.string().optional().transform((str) => str ? new Date(str) : null),
    location: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("PUBLISHED"),
});

export async function createEvent(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        title: formData.get("title"),
        start: formData.get("start"),
        end: formData.get("end"),
        location: formData.get("location"),
        description: formData.get("description"),
    };

    const validatedData = EventSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: "Données invalides" };
    }

    try {
        await prisma.event.create({
            data: validatedData.data,
        });
        revalidatePath("/admin/dashboard/events");
        revalidatePath("/evenements"); // Public events page
        redirect("/admin/dashboard/events");
    } catch (error) {
        console.error("Create event error:", error);
        return { error: "Erreur lors de la création" };
    }
}

export async function deleteEvent(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    try {
        await prisma.event.delete({ where: { id } });
        revalidatePath("/admin/dashboard/events");
        revalidatePath("/evenements");
    } catch (error) {
        console.error("Delete event error:", error);
        return { error: "Erreur lors de la suppression" };
    }
}

// Ne retourner que les événements publiés sur la page publique
export async function updateEvent(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        title: formData.get("title"),
        start: formData.get("start"),
        end: formData.get("end"),
        location: formData.get("location"),
        description: formData.get("description"),
        status: formData.get("status") ?? "PUBLISHED",
    };

    const validatedData = EventSchema.safeParse(rawData);
    if (!validatedData.success) {
        return { error: "Données invalides" };
    }

    try {
        await prisma.event.update({
            where: { id },
            data: validatedData.data,
        });
        revalidatePath("/admin/dashboard/events");
        revalidatePath("/evenements");
        redirect("/admin/dashboard/events");
    } catch (error) {
        console.error("Update event error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}

export async function getPublicEvents() {
    noStore();
    try {
        const events = await prisma.event.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { start: "asc" },
        });
        return events;
    } catch (error) {
        console.error("Error fetching public events:", error);
        return [];
    }
}
