"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hasAdminAccess } from "@/lib/roles";
import { unstable_noStore as noStore } from "next/cache";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        type: "EVENT" | "APPOINTMENT";
        status?: string;
        location?: string | null;
        userName?: string | null;
        userOrganization?: string | null;
    };
}

export async function getGlobalCalendarEvents(): Promise<CalendarEvent[]> {
    noStore();
    const session = await auth();
    if (!session?.user) {
        throw new Error("Action non autorisée");
    }
    const role = session.user.role as string;
    const isAllowed = hasAdminAccess(role);

    if (!session?.user || !role || !isAllowed) {
        throw new Error("Action non autorisée");
    }

    // 1. Récupération des Événements (Actions de l'association)
    const events = await prisma.event.findMany({
        select: {
            id: true,
            title: true,
            start: true,
            end: true,
            location: true,
        },
    });

    // 2. Récupération des Rendez-vous (Dépôts/Collectes Partenaires)
    const appointments = await prisma.appointment.findMany({
        select: {
            id: true,
            type: true,
            date: true,
            status: true,
            user: {
                select: {
                    name: true,
                    organizationName: true,
                }
            }
        }
    });

    // 3. Formatage pour FullCalendar
    const formattedEvents: CalendarEvent[] = events.map(ev => ({
        id: `ev_${ev.id}`,
        title: ev.title,
        start: ev.start,
        end: ev.end ? ev.end : undefined,
        backgroundColor: "#2563ea", // blue-600
        borderColor: "#1d4ed8", // blue-700
        textColor: "#ffffff",
        extendedProps: {
            type: "EVENT",
            location: ev.location,
        }
    }));

    const formattedAppointments: CalendarEvent[] = appointments.map(apt => {
        const isConfirmed = apt.status === "CONFIRMED";
        const isPending = apt.status === "PENDING";

        let bgColor = "#64748b"; // slate-500 (Cancelled or other)
        let borderColor = "#475569";

        if (isConfirmed) {
            bgColor = "#059669"; // emerald-600
            borderColor = "#047857";
        } else if (isPending) {
            bgColor = "#EA580C"; // orange-600
            borderColor = "#C2410C";
        }

        const typeLabel = apt.type === "COLLECTE" ? "🚚 Collecte" : "📦 Dépôt";

        return {
            id: `apt_${apt.id}`,
            title: `${typeLabel} - ${apt.user.organizationName || apt.user.name}`,
            start: apt.date,
            // Rendez-vous d'une heure par défaut pour l'affichage visuel
            end: new Date(new Date(apt.date).getTime() + 60 * 60 * 1000),
            backgroundColor: bgColor,
            borderColor: borderColor,
            textColor: "#ffffff",
            extendedProps: {
                type: "APPOINTMENT",
                status: apt.status,
                userName: apt.user.name,
                userOrganization: apt.user.organizationName,
            }
        };
    });

    return [...formattedEvents, ...formattedAppointments];
}
