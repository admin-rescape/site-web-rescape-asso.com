import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendrierPage() {
    const session = await auth();
    if (!session?.user) redirect("/admin");

    const now = new Date();
    const events = await prisma.event.findMany({
        where: { start: { gte: now } },
        orderBy: { start: "asc" },
        take: 20
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-blue-600" />
                        Calendrier des Actions
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Retrouvez toutes les prochaines actions et événements de l&apos;association.</p>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
                    <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-slate-600 mb-2">Aucun événement à venir</h2>
                    <p className="text-slate-400">La direction ajoutera prochainement les prochaines actions planifiées.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((ev) => {
                        const start = new Date(ev.start);
                        const monthLabel = start.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
                        const dayLabel = start.getDate();

                        return (
                            <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6 p-5 hover:border-blue-100 hover:shadow-md transition-all group">
                                <div className="flex-shrink-0 w-14 text-center bg-blue-50 rounded-xl py-2 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                    <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest">{monthLabel}</p>
                                    <p className="text-2xl font-extrabold text-blue-700 leading-none">{dayLabel}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-extrabold text-slate-800 text-lg">{ev.title}</h3>
                                    <div className="flex flex-wrap items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <Clock className="w-4 h-4" />
                                            {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            {ev.end && ` — ${new Date(ev.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                        </span>
                                        {ev.location && (
                                            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                <MapPin className="w-4 h-4" />
                                                {ev.location}
                                            </span>
                                        )}
                                    </div>
                                    {ev.description && <p className="text-sm text-slate-400 mt-1.5 line-clamp-1">{ev.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
