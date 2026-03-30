"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { donationSchema } from "@/lib/validations/appointment-donation";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/roles";

export async function createDonation(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role) && role !== "PARTENAIRE") {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        donationType: formData.get("donationType"),
        quantity: parseFloat(formData.get("quantity") as string),
        unit: formData.get("unit"),
        date: formData.get("date"),
        notes: formData.get("notes") || "",
        donorName: formData.get("donorName") || undefined,
    };

    const validated = donationSchema.safeParse(rawData);
    if (!validated.success) return { error: "Données invalides" };

    const isPartner = role === "PARTENAIRE";

    // Cast donorName to the inferred type from Prisma
    const donationData: Parameters<typeof prisma.donation.create>[0]["data"] = {
        donationType: validated.data.donationType,
        quantity: validated.data.quantity,
        unit: validated.data.unit,
        date: new Date(validated.data.date),
        notes: validated.data.notes,
        userId: isPartner ? session.user.id : null,
    };

    if (!isPartner) {
        donationData.donorName = validated.data.donorName || "Anonyme";
    }

    await prisma.donation.create({
        data: donationData
    });

    revalidatePath("/admin/dashboard/dons");
    return { success: true };
}

export async function getDonations() {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (hasAdminAccess(role)) {
        return await prisma.donation.findMany({
            include: { user: { select: { organizationName: true, name: true } } },
            orderBy: { date: "desc" }
        });
    }

    if (role === "PARTENAIRE") {
        return await prisma.donation.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" }
        });
    }

    throw new Error("Action non autorisée");
}
