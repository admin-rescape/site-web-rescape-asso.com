import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { isDirectionRole } from "@/lib/roles";

import { MegaCalendar } from "@/components/admin/MegaCalendar";

export default async function GlobalCalendarPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-indigo-600" />
                        Méga-Calendrier
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Vue consolidée de l&apos;ensemble des événements publics et des rendez-vous partenaires.
                    </p>
                </div>
            </div>

            <MegaCalendar />
        </div>
    );
}
