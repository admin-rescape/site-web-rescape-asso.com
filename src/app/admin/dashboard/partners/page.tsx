import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShieldCheck, Star, StarOff, ExternalLink, Globe, Edit2 } from "lucide-react";
import { togglePartnerHighlight } from "@/app/admin/actions/partner";
import Link from "next/link";
import { isDirectionRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PartnersAdminPage() {
    const session = await auth();
    if (!session || !isDirectionRole(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const partners = await prisma.partner.findMany({
        orderBy: { name: "asc" },
        include: { user: { select: { email: true, name: true } } }
    });

    const highlighted = partners.filter(p => p.isHighlighted).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-amber-500" />
                        Gestion des Partenaires
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {partners.length} partenaire{partners.length > 1 ? "s" : ""} — <span className="text-amber-600 font-bold">{highlighted} mis en avant</span> sur la vitrine.
                    </p>
                </div>
                <div className="relative z-10 w-full sm:w-auto">
                    <Link
                        href="/admin/dashboard/partners/new"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200 uppercase tracking-widest"
                    >
                        Ajouter un Partenaire
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-extrabold text-slate-700">Liste des partenaires</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {partners.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 font-medium">
                            Aucun partenaire dans la base. Cliquez sur &quot;Ajouter un Partenaire&quot; pour commencer.
                        </div>
                    ) : partners.map((p) => (
                        <div key={p.id} className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 flex items-center flex-wrap gap-2">
                                        {p.name}
                                        {p.isHighlighted && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest mt-1 sm:mt-0">
                                                <Star className="w-3 h-3" /> Mis en avant
                                            </span>
                                        )}
                                    </p>
                                    {p.user && (
                                        <p className="text-sm text-slate-400 mt-0.5">{p.user.email}</p>
                                    )}
                                    {p.link && (
                                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-0.5 break-all">
                                            {p.link.replace(/^https?:\/\//, '').slice(0, 40)}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                                <Link
                                    href={`/admin/dashboard/partners/${p.id}/edit`}
                                    className="flex-1 lg:flex-none justify-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" /> Modifier
                                </Link>
                                <form action={async () => {
                                    "use server";
                                    await togglePartnerHighlight(p.id, !p.isHighlighted);
                                }} className="flex-1 lg:flex-none flex">
                                    <button type="submit" className={`w-full justify-center flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${p.isHighlighted ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600"}`}>
                                        {p.isHighlighted ? (
                                            <><StarOff className="w-4 h-4" /> Retirer</>
                                        ) : (
                                            <><Star className="w-4 h-4" /> Mettre en avant</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
