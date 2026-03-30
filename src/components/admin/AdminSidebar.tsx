"use client";

import Link from "next/link";
import {
    LayoutDashboard, FileText, Calendar, Users,
    MessageSquare, Calculator, Settings, Activity,
    Clock, ShieldCheck, Package, CreditCard, Briefcase, Lock
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { isDirectionRole, isSuperAdmin, isTresorier } from "@/lib/roles";
import { LogoutSidebarButton } from "@/components/admin/LogoutSidebarButton";

interface AdminSidebarProps {
    role: string;
    label: string;
    userName: string;
}

export function AdminSidebar({ role, label, userName }: AdminSidebarProps) {
    const pathname = usePathname() || "";

    const hasAccess = (allowedRoles: string[]) => {
        const currentRoles = [role];

        if (isDirectionRole(role) && !isTresorier(role)) {
            currentRoles.push("DIRECTION");
        }
        if (isTresorier(role)) {
            currentRoles.push("TRESORIERE");
        }
        if (isSuperAdmin(role)) {
            currentRoles.push("SUPER_ADMIN");
        }

        return allowedRoles.some(r => currentRoles.includes(r));
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-10 h-screen sticky top-0">
            <div className="p-6 border-b border-slate-100 flex items-center justify-center flex-col gap-3 pb-8 shrink-0">
                <div className="relative inline-flex flex-col items-center leading-none mt-2 w-full">
                    <span className="font-pacifico text-4xl text-emerald-600 relative z-10 transition-colors hover:text-emerald-500">
                        Rescape
                    </span>
                    <div className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-md flex items-center gap-2 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="font-nunito font-extrabold text-[0.6rem] uppercase tracking-[0.2em]">
                            {label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                <div className="space-y-8">
                    {/* Principal */}
                    <div>
                        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Général</p>
                        <nav className="space-y-1.5">
                            <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname === "/admin/dashboard" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                <div className={`p-1.5 rounded-md transition-colors ${pathname === "/admin/dashboard" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                    <LayoutDashboard className="w-4 h-4" />
                                </div>
                                <span className="text-sm">Tableau de Bord</span>
                            </Link>
                            <Link href="/admin/dashboard/messagerie" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/messagerie") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/messagerie") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <span className="text-sm">Messagerie</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Contenu du Site - Direction & Admin */}
                    {hasAccess(["SUPER_ADMIN", "DIRECTION"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contenu Vitrine</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/articles" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/articles") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/articles") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Actualités</span>
                                </Link>
                                <Link href="/admin/dashboard/events" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/events") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/events") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Événements</span>
                                </Link>
                                <Link href="/admin/dashboard/actions" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/actions") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/actions") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Actions Publiques</span>
                                </Link>
                                <Link href="/admin/dashboard/timeline" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/timeline") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/timeline") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Histoire</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Gestion Métier - DIRECTION ONLY (Super Admin INTERDIT) */}
                    {hasAccess(["DIRECTION"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Administration Métier</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/calendrier-global" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/calendrier-global") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/calendrier-global") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Méga-Calendrier</span>
                                </Link>
                                <Link href="/admin/dashboard/compta" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/compta") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/compta") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calculator className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Finances & Comptabilité</span>
                                </Link>
                                <Link href="/admin/dashboard/adherents" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/adherents") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/adherents") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Adhérents & Cotisations</span>
                                </Link>
                                <Link href="/admin/dashboard/partners" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/partners") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/partners") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Gestion Partenaires</span>
                                </Link>
                                <Link href="/admin/dashboard/dons" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/dons") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/dons") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Dons Physiques</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Espace Trésorier — Finances & Adhérents (+ vue Bénévole) */}
                    {hasAccess(["TRESORIERE"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Finances & Comptabilité</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/compta" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/compta") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/compta") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calculator className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Finances & Comptabilité</span>
                                </Link>
                                <Link href="/admin/dashboard/adherents" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/adherents") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/adherents") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Adhérents & Cotisations</span>
                                </Link>
                                <Link href="/admin/dashboard/dons" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/dons") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/dons") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Dons Physiques</span>
                                </Link>
                                <Link href="/admin/dashboard/calendrier-global" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/calendrier-global") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/calendrier-global") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Méga-Calendrier</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Partenaire Espace */}
                    {hasAccess(["PARTENAIRE"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Espace Partenaire</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/mes-dons" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/mes-dons") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/mes-dons") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Mes Dons & Reçus</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Bénévoles Espace */}
                    {hasAccess(["BENEVOLE", "TRESORIERE"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Espace Bénévole</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/calendrier" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/calendrier") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/calendrier") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Calendrier Actions</span>
                                </Link>
                                <Link href="/admin/dashboard/missions" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/missions") ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/missions") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Mes Missions</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Ressources Humaines - SUPER_ADMIN & DIRECTION */}
                    {hasAccess(["SUPER_ADMIN", "DIRECTION"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ressources Humaines</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/team" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/team") ? "bg-purple-50 text-purple-700 shadow-sm border border-purple-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/team") ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">L&apos;Équipe</span>
                                </Link>
                                <Link href="/admin/dashboard/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/users") ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/users") ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Contrôle des Accès</span>
                                </Link>
                                <Link href="/admin/dashboard/missions" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/missions") ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/missions") ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Missions Bénévoles</span>
                                </Link>
                            </nav>
                        </div>
                    )}

                    {/* Sup Administration - SUPER_ADMIN ONLY (Direction Interdite) */}
                    {hasAccess(["SUPER_ADMIN"]) && (
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Maintenance Technique</p>
                            <nav className="space-y-1.5">
                                <Link href="/admin/dashboard/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group ${pathname.startsWith("/admin/dashboard/settings") ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/settings") ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Config Système</span>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3 mb-4 px-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold uppercase shrink-0">
                        {userName.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 truncate uppercase mt-0.5">{label}</p>
                    </div>
                </div>
                <Link href="/admin/dashboard/profil" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group mb-2 ${pathname.startsWith("/admin/dashboard/profil") ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                    <div className={`p-1.5 rounded-md transition-colors ${pathname.startsWith("/admin/dashboard/profil") ? "bg-slate-800 text-indigo-400" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                        <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Mon profil</span>
                </Link>
                <LogoutSidebarButton />
            </div>
        </aside>
    );
}
