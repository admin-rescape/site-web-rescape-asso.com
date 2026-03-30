"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

/**
 * Horaires de Rescape :
 * Lu, Ma, Je, Ve : 9h-11h / 14h-16h
 * Samedi (pair seulement) : 10h-12h / 14h-17h
 * Mercredi et Dimanche : Fermé
 */

function isEvenWeek(date: Date) {
    // Calcul simple pour déterminer si le samedi est "pair" (semaine paire de l'année)
    // On utilise la norme ISO pour le numéro de semaine
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo % 2 === 0;
}

export function OpeningStatus() {
    const [status, setStatus] = useState<{ open: boolean; message: string } | null>(null);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const slots = [
                { day: 1, start: 9 * 60, end: 11 * 60 }, { day: 1, start: 14 * 60, end: 16 * 60 },
                { day: 2, start: 9 * 60, end: 11 * 60 }, { day: 2, start: 14 * 60, end: 16 * 60 },
                // Mercredi fermé
                { day: 4, start: 9 * 60, end: 11 * 60 }, { day: 4, start: 14 * 60, end: 16 * 60 },
                { day: 5, start: 9 * 60, end: 11 * 60 }, { day: 5, start: 14 * 60, end: 16 * 60 },
                // Samedi (on verra la parité après)
                { day: 6, start: 10 * 60, end: 12 * 60 }, { day: 6, start: 14 * 60, end: 17 * 60 },
            ];

            const currentDay = now.getDay();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            // 1. Vérifier si on est ouvert MAINTENANT
            let currentlyOpen = false;
            const currentSlots = slots.filter(s => s.day === currentDay);

            for (const slot of currentSlots) {
                if (currentDay === 6 && !isEvenWeek(now)) continue;
                if (currentTime >= slot.start && currentTime < slot.end) {
                    currentlyOpen = true;
                    break;
                }
            }

            if (currentlyOpen) {
                setStatus({ open: true, message: "Ouvert actuellement ! Passez nous voir." });
                return;
            }

            // 2. Trouver la PROCHAINE ouverture
            let nextMessage = "Actuellement fermé";

            for (let i = 0; i < 14; i++) {
                const targetDate = new Date(now);
                targetDate.setDate(now.getDate() + i);
                const targetDay = targetDate.getDay();

                // Trier les slots par heure de début
                const daySlots = slots.filter(s => s.day === targetDay).sort((a, b) => a.start - b.start);
                for (const slot of daySlots) {
                    if (i === 0 && slot.end <= currentTime) continue;
                    if (targetDay === 6 && !isEvenWeek(targetDate)) continue;

                    const daysLabel = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
                    const dayName = i === 0 ? "aujourd'hui" : i === 1 ? "demain" : `ce ${daysLabel[targetDay]}`;

                    // Formater l'heure (ex: 9h, 14h30)
                    const h = Math.floor(slot.start / 60);
                    const m = slot.start % 60;
                    const timeStr = `${h}h${m > 0 ? m.toString().padStart(2, "0") : ""}`;

                    nextMessage = `Prochaine ouverture ${dayName} à ${timeStr}`;
                    setStatus({ open: false, message: nextMessage });
                    return;
                }
            }
        };

        checkStatus();
        const timer = setInterval(checkStatus, 60000);
        return () => clearInterval(timer);
    }, []);

    if (!status) return null;

    return (
        <div
            id="opening-status"
            className="flex items-center justify-center lg:justify-start gap-2 text-sm font-nunito"
        >
            <span
                className={clsx(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    status.open ? "bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
                )}
                aria-hidden="true"
            ></span>
            <span className={clsx(
                "font-bold leading-tight",
                status.open ? "text-success" : "text-red-500"
            )}>
                {status.message}
            </span>
        </div>
    );
}
