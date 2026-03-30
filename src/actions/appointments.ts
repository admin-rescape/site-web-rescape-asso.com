"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { appointmentSchema } from "@/lib/validations/appointment-donation";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/roles";

export async function createAppointment(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role) && role !== "PARTENAIRE") {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        type: formData.get("type"),
        date: formData.get("date"),
        notes: formData.get("notes") || "",
    };

    const validated = appointmentSchema.safeParse(rawData);
    if (!validated.success) return { error: "Données invalides" };

    await prisma.appointment.create({
        data: {
            ...validated.data,
            date: new Date(validated.data.date),
            userId: session.user.id!,
        },
    });

    revalidatePath("/admin/dashboard/calendrier");
    return { success: true };
}

export async function getAppointments() {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (hasAdminAccess(role)) {
        return await prisma.appointment.findMany({
            include: { user: { select: { organizationName: true, name: true } } },
            orderBy: { date: "asc" }
        });
    }

    if (role === "PARTENAIRE") {
        return await prisma.appointment.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "asc" }
        });
    }

    throw new Error("Action non autorisée");
}
