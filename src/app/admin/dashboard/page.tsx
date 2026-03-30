import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageSquare, Calendar as CalendarIcon, FileText, ArrowUpRight, Clock, UserCheck, HeartHandshake, CreditCard, Flame } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminAccess, isTresorier } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/admin");

    const role = session.user.role as string || "BENEVOLE";
    const isDirection = hasAdminAccess(role);
    const isTresoriere = isTresorier(role);
    const isPartner = role === "PARTENAIRE";
    const isBenevole = role === "BENEVOLE";

    // For Direction/Admin
    const [messageCount, eventCount, articleCount, partnerCount, recentMessages] = await Promise.all([
        isDirection ? prisma.message.count({ where: { read: false } }) : Promise.resolve(0),
        prisma.event.count({ where: { start: { gte: new Date() } } }),
        isDirection ? prisma.article.count({ where: { published: true } }) : Promise.resolve(0),
        isDirection ? prisma.user.count({ where: { role: "PARTENAIRE" } }) : Promise.resolve(0),
        isDirection ? prisma.message.findMany({
            take: 4,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, subject: true, createdAt: true, read: true }
        }) : Promise.resolve([])
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord</h1>
                    <p className="text-slate-500 mt-2 text-base font-medium">Bienvenue sur votre espace, <span className="text-emerald-600 font-bold">{session.user.name || "Utilisateur"}</span>. Bonne journée !</p>
                </div>
            </div>

            {/* Direction & Admin Dashboard */}
            {isDirection && (
                <>
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                {messageCount > 0 && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">+{messageCount} nouv.</span>}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 tracking-wide mb-1">Messages Non Lus</h3>
                            <p className="text-3xl font-extrabold text-slate-800">{messageCount}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <HeartHandshake className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 tracking-wide mb-1">Articles Actifs</h3>
                            <p className="text-3xl font-extrabold text-slate-800">{articleCount}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 tracking-wide mb-1">Événements A Venir</h3>
                            <p className="text-3xl font-extrabold text-slate-800">{eventCount}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-500 tracking-wide mb-1">Partenaires</h3>
                            <p className="text-3xl font-extrabold text-slate-800">{partnerCount}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Derniers Messages */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    Boîte de Réception (Aperçu)
                                </h2>
                                <Link href="/admin/dashboard/messages" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                                    Tout voir
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>
                            <div className="p-0">
                                {recentMessages.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">Aucun message pour le moment.</div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {recentMessages.map((msg) => (
                                            <div key={msg.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                                <div className="flex flex-col max-w-[70%]">
                                                    <p className="font-bold text-slate-800 truncate">{msg.subject || "Sans objet"}</p>
                                                    <p className="text-sm text-slate-500 mt-0.5 truncate flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        {msg.name}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-xs font-semibold text-slate-400">
                                                        {new Date(msg.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {!msg.read ? (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider">
                                                            Nouveau
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                                            Lu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions / Shortcuts */}
                        <div className="bg-slate-900 rounded-3xl shadow-lg shadow-slate-900/10 border border-slate-800 text-white flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none"></div>
                            <div className="p-6 border-b border-slate-800/50 relative z-10">
                                <h2 className="text-lg font-extrabold flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-emerald-400" />
                                    Actions Rapides
                                </h2>
                            </div>
                            <div className="p-4 flex flex-col gap-2 relative z-10">
                                {isTresoriere ? (
                                    // Actions Trésorière : finances uniquement
                                    <>
                                        <Link href="/admin/dashboard/compta/new" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-amber-600 transition-colors"><CreditCard className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Saisir une écriture</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                        <Link href="/admin/dashboard/adherents" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-indigo-600 transition-colors"><UserCheck className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Adhérents & Cotisations</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                        <Link href="/admin/dashboard/dons" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-emerald-600 transition-colors"><HeartHandshake className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Dons Physiques</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                    </>
                                ) : (
                                    // Actions Direction : articles, événements, compta
                                    <>
                                        <Link href="/admin/dashboard/articles/new" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-emerald-600 transition-colors"><FileText className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Rédiger un article</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                        <Link href="/admin/dashboard/events/new" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-blue-600 transition-colors"><CalendarIcon className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Nouvel événement</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                        <Link href="/admin/dashboard/compta" className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-2xl flex items-center justify-between transition-all outline-none group/action border border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-700 rounded-lg group-hover/action:bg-amber-600 transition-colors"><CreditCard className="w-4 h-4" /></div>
                                                <span className="font-semibold text-sm text-slate-200 group-hover/action:text-white">Comptabilité & Dons</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-amber-400 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-all" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Partenaire Dashboard */}
            {isPartner && (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                        <HeartHandshake className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Espace Partenaire</h2>
                    <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
                        Bienvenue sur votre espace dédié. Ici vous pourrez gérer vos dons, retrouver l&apos;historique de nos actions communes, et échanger avec la direction.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link href="/admin/dashboard/mes-dons" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20">
                            Voir mes dons
                        </Link>
                        <Link href="/admin/dashboard/messages-asso" className="bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all shadow-sm">
                            Contacter l'Asso
                        </Link>
                    </div>
                </div>
            )}

            {/* Bénévole Dashboard */}
            {isBenevole && (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                        <UserCheck className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Espace Bénévole</h2>
                    <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
                        Merci pour votre engagement à nos côtés ! Retrouvez ici vos prochaines missions et le calendrier complet des actions de l&apos;association.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Link href="/admin/dashboard/calendrier" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20">
                            Consulter le Calendrier
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}
