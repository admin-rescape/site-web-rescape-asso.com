"use server";

import { prisma } from "@/lib/prisma";

export async function getStats() {
    try {
        const [eventsCount, partnersCount, benevolesCount, donationsKg] = await Promise.all([
            prisma.event.count(),
            prisma.partner.count(),
            prisma.user.count({ where: { role: "BENEVOLE" } }),
            prisma.donation.aggregate({
                _sum: { quantity: true },
                where: { unit: "KG" }
            })
        ]);

        const totalKg = donationsKg._sum.quantity || 0;

        return [
            { label: "Bénévoles Engagés", value: benevolesCount, suffix: "" },
            { label: "Partenaires", value: partnersCount, suffix: "" },
            { label: "Kilos Redistribués", value: Math.round(totalKg), suffix: " kg" },
            { label: "Événements Organisés", value: eventsCount, suffix: "" }
        ];
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        return [
            { label: "Bénévoles Engagés", value: 0, suffix: "" },
            { label: "Partenaires", value: 0, suffix: "" },
            { label: "Kilos Redistribués", value: 0, suffix: " kg" },
            { label: "Événements Organisés", value: 0, suffix: "" }
        ];
    }
}
