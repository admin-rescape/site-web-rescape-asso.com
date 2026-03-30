import { auth } from "@/auth";
import { isDirectionRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Clock, Plus, MoreHorizontal } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TimelineAdminPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const events = await prisma.timelineEntry.findMany({
        orderBy: { order: "asc" },
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-emerald-600" />
                        Historique (Timeline)
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez le fil rouge de l'histoire de l'association sur la page "Notre Histoire".</p>
                </div>
                <Link href="/admin/dashboard/timeline/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Ajouter une Période
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                {events.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        Aucun événement chronologique.
                    </div>
                ) : (
                    <div className="p-6 relative">
                        {/* Ligne verticale timeline */}
                        <div className="absolute top-10 bottom-10 left-[4.5rem] w-px bg-slate-200 z-0 hidden sm:block"></div>

                        <div className="space-y-8 relative z-10">
                            {events.map((evt) => (
                                <div key={evt.id} className="flex flex-col sm:flex-row gap-6 items-start group">
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-400 font-mono text-sm font-bold bg-slate-50 rounded-full ring-1 ring-slate-200">
                                            {evt.order}
                                        </div>
                                        <div className="w-12 h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm ring-1 ring-emerald-600/10">
                                            {evt.icon}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white border border-slate-100 rounded-xl p-5 shadow-sm group-hover:border-emerald-200 group-hover:shadow-md transition-all relative">
                                        <h3 className="text-lg font-bold text-slate-800">{evt.title}</h3>
                                        {evt.caption && (
                                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                {evt.caption}
                                            </span>
                                        )}
                                        <p className="text-slate-600 text-sm mt-3 leading-relaxed mb-4 line-clamp-2">{evt.content}</p>

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/dashboard/timeline/${evt.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
