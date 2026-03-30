"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { clsx } from "clsx";
import {
    Menu, X, LayoutDashboard, FileText, Calendar, Users,
    MessageSquare, Calculator, Settings, Activity,
    Clock, ShieldCheck, Package, CreditCard, LogOut, Briefcase
} from "lucide-react";
import { isDirectionRole, isSuperAdmin, isTresorier } from "@/lib/roles";

interface AdminMobileNavProps {
    role: string;
    label: string;
    userName: string;
}

export function AdminMobileNav({ role, label, userName }: AdminMobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

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
        <>
            {/* Header Mobile avec Hamburger */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white shadow-sm z-50 sticky top-0 md:hidden">
                <div className="flex items-center gap-3">
                    <div className="relative inline-flex flex-col items-center leading-none mt-1">
                        <span className="font-pacifico text-2xl text-emerald-600 relative z-10 transition-colors">
                            Rescape
                        </span>
                        <div className="px-2 py-0.5 bg-slate-900 text-white rounded flex items-center gap-1 shadow-sm">
                            <span className="font-nunito font-extrabold text-[0.4rem] uppercase tracking-widest leading-none">
                                {label}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -mr-2 text-slate-500 hover:text-emerald-600 transition-colors"
                    aria-label="Menu Mobile"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Menu Drawer Mobile */}
            <div
                className={clsx(
                    "fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 text-sm font-bold uppercase shrink-0">
                            {userName.charAt(0)}
                        </div>
                        <div className="min-w-0 pr-4 flex-1">
                            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                            <p className="text-[10px] font-semibold text-emerald-600 truncate uppercase mt-0.5">{label}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    <div className="space-y-8">
                        {/* Principal */}
                        <div>
                            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Général</p>
                            <nav className="space-y-1.5">
                                <Link onClick={() => setIsOpen(false)} href="/admin/dashboard" className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group", pathname === "/admin/dashboard" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50")}>
                                    <div className={clsx("p-1.5 rounded-md transition-colors", pathname === "/admin/dashboard" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}><LayoutDashboard className="w-4 h-4" /></div>
                                    <span className="text-sm">Tableau de Bord</span>
                                </Link>
                                <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/messagerie" className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all group", pathname === "/admin/dashboard/messagerie" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50")}>
                                    <div className={clsx("p-1.5 rounded-md transition-colors", pathname === "/admin/dashboard/messagerie" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}><MessageSquare className="w-4 h-4" /></div>
                                    <span className="text-sm">Messagerie</span>
                                </Link>
                            </nav>
                        </div>

                        {/* Contenu Vitrine */}
                        {hasAccess(["SUPER_ADMIN", "DIRECTION"]) && (
                            <div>
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contenu Vitrine</p>
                                <nav className="space-y-1.5">
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/articles" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><FileText className="w-4 h-4" /></div>
                                        <span className="text-sm">Actualités</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calendar className="w-4 h-4" /></div>
                                        <span className="text-sm">Événements</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/actions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Activity className="w-4 h-4" /></div>
                                        <span className="text-sm">Actions Publiques</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/timeline" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Clock className="w-4 h-4" /></div>
                                        <span className="text-sm">Histoire</span>
                                    </Link>
                                </nav>
                            </div>
                        )}

                        {/* Administration Métier */}
                        {hasAccess(["DIRECTION"]) && (
                            <div>
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Administration Métier</p>
                                <nav className="space-y-1.5">
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/calendrier-global" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calendar className="w-4 h-4" /></div>
                                        <span className="text-sm">Méga-Calendrier</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/compta" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calculator className="w-4 h-4" /></div>
                                        <span className="text-sm">Finances & Comptabilité</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/adherents" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><CreditCard className="w-4 h-4" /></div>
                                        <span className="text-sm">Adhérents & Cotisations</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/partners" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><ShieldCheck className="w-4 h-4" /></div>
                                        <span className="text-sm">Gestion Partenaires</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/dons" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Package className="w-4 h-4" /></div>
                                        <span className="text-sm">Dons Physiques</span>
                                    </Link>
                                </nav>
                            </div>
                        )}

                        {/* Espace Trésorier — Finances & Adhérents */}
                        {hasAccess(["TRESORIERE"]) && (
                            <div>
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Finances & Comptabilité</p>
                                <nav className="space-y-1.5">
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/compta" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calculator className="w-4 h-4" /></div>
                                        <span className="text-sm">Finances & Comptabilité</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/adherents" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><CreditCard className="w-4 h-4" /></div>
                                        <span className="text-sm">Adhérents & Cotisations</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/dons" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Package className="w-4 h-4" /></div>
                                        <span className="text-sm">Dons Physiques</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/calendrier-global" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calendar className="w-4 h-4" /></div>
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
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/mes-dons" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Package className="w-4 h-4" /></div>
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
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/calendrier" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Calendar className="w-4 h-4" /></div>
                                        <span className="text-sm">Calendrier Actions</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/missions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Briefcase className="w-4 h-4" /></div>
                                        <span className="text-sm">Mes Missions</span>
                                    </Link>
                                </nav>
                            </div>
                        )}

                        {/* Ressources Humaines */}
                        {hasAccess(["SUPER_ADMIN", "DIRECTION"]) && (
                            <div>
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ressources Humaines</p>
                                <nav className="space-y-1.5">
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Users className="w-4 h-4" /></div>
                                        <span className="text-sm">Contrôle des Accès</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/team" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Users className="w-4 h-4" /></div>
                                        <span className="text-sm">L&apos;Équipe</span>
                                    </Link>
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/missions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Briefcase className="w-4 h-4" /></div>
                                        <span className="text-sm">Gestion Missions Bénévoles</span>
                                    </Link>
                                </nav>
                            </div>
                        )}

                        {/* Maintenance Technique */}
                        {hasAccess(["SUPER_ADMIN"]) && (
                            <div>
                                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Maintenance Technique</p>
                                <nav className="space-y-1.5">
                                    <Link onClick={() => setIsOpen(false)} href="/admin/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all group">
                                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400 group-hover:bg-slate-200 transition-colors"><Settings className="w-4 h-4" /></div>
                                        <span className="text-sm">Config Système</span>
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex justify-center items-center gap-2 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold py-3 rounded-xl transition-all shadow-sm"
                    >
                        <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                </div>
            </div>
        </>
    );
}
