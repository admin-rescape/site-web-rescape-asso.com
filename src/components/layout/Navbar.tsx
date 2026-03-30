"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { isDirectionRole, isSuperAdmin, isPortalRole, isTresorier } from "@/lib/roles";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";

type NavItem = { name: string; href: string };

const publicNavigation: NavItem[] = [
    { name: "Accueil", href: "/" },
    { name: "Notre Histoire", href: "/histoire" },
    { name: "Nos Actions", href: "/actions" },
    { name: "Nos Partenaires", href: "/partenaires" },
    { name: "Actualités", href: "/actualites" },
    { name: "Événements", href: "/evenements" },
    { name: "Contact", href: "/contact" },
];

const portalNavigation: Record<string, NavItem[]> = {
    SUPER_ADMIN: [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Articles", href: "/admin/dashboard/articles" },
        { name: "Événements", href: "/admin/dashboard/events" },
        { name: "Messages", href: "/admin/dashboard/messages" },
        { name: "Utilisateurs", href: "/admin/dashboard/users" },
        { name: "Compta", href: "/admin/dashboard/compta" },
    ],
    // Le nom ici n'est plus utilisé comme clé exacte pour la Direction, on utilise une fonction.
    DIRECTION_GROUP: [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Articles", href: "/admin/dashboard/articles" },
        { name: "Événements", href: "/admin/dashboard/events" },
        { name: "Messages", href: "/admin/dashboard/messages" },
        { name: "Utilisateurs", href: "/admin/dashboard/users" },
        { name: "Compta", href: "/admin/dashboard/compta" },
        { name: "Missions & Bénévoles", href: "/admin/dashboard/missions" },
    ],
    BENEVOLE: [
        { name: "Mes Missions", href: "/admin/dashboard/missions" },
        { name: "Agenda", href: "/admin/dashboard/calendrier" },
    ],
    TRESORIERE: [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Compta", href: "/admin/dashboard/compta" },
        { name: "Adhérents", href: "/admin/dashboard/adherents" },
        { name: "Mes Missions", href: "/admin/dashboard/missions" },
    ],
    PARTENAIRE: [
        { name: "Mes Dons", href: "/admin/dashboard/mes-dons" },
        { name: "Messages", href: "/admin/dashboard/messages-asso" },
    ],
};

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { data: session, status } = useSession();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const isAuthenticated = status === "authenticated" && session?.user;
    const role = (session?.user as { role?: string } | undefined)?.role;

    // Determine whether this role should be offered a portal link.
    const hasPortalAccess = (r?: string | null) => {
        return isPortalRole(r);
    };

    const isPortal = isAuthenticated && hasPortalAccess(role);

    // Toujours afficher la navigation publique
    const navigation = publicNavigation;
    const brandText = "Rescape";
    const brandHref = "/";

    // Détermination dynamique du lien Portail
    let portalLink = "/";
    if (isPortal) {
        if (isSuperAdmin(role)) {
            portalLink = portalNavigation.SUPER_ADMIN[0].href;
        } else if (isTresorier(role)) {
            portalLink = "/admin/dashboard/compta";
        } else if (isDirectionRole(role)) {
            portalLink = portalNavigation.DIRECTION_GROUP[0].href;
        } else if (role === "BENEVOLE") {
            portalLink = portalNavigation.BENEVOLE[0].href;
        } else if (role === "PARTENAIRE") {
            portalLink = portalNavigation.PARTENAIRE[0].href;
        } else {
            const portalNavForRole: NavItem[] | undefined = role ? portalNavigation[role] : undefined;
            portalLink = portalNavForRole?.[0]?.href || "/";
        }
    }

    const isActive = (path: string) => pathname === path;

    return (
        <nav id="site-navbar" className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-primary/10 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* Logo */}
                    <div id="navbar-logo" className="flex-shrink-0 flex items-center">
                        <Link href={brandHref} className="relative inline-flex flex-col items-start leading-none group" onClick={() => setIsOpen(false)}>
                            <span className="font-pacifico text-3xl text-primary group-hover:text-secondary transition-colors relative z-10">{brandText}</span>
                            <span className="absolute -bottom-2 left-1 font-nunito font-extrabold text-[0.6rem] uppercase tracking-widest text-dark/60 group-hover:text-primary transition-colors select-none">
                                Loi 1901
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-1 items-center">
                        <ul id="desktop-nav-menu" className="flex space-x-1 items-center">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={clsx(
                                            "nav-link px-3 py-2 rounded-lg font-nunito font-bold text-base transition-all active:scale-95",
                                            isActive(item.href) ? "text-primary bg-primary/5" : "text-dark hover:text-primary hover:bg-surface"
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {isPortal ? (
                            <div className="ml-4 flex gap-2">
                                <Link
                                    href={portalLink}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-nunito font-bold text-sm shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    Mon Espace
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100/80 text-slate-700 font-nunito font-bold text-sm border border-slate-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <div id="navbar-cta" className="ml-4">
                                <Link
                                    href="/soutenir"
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-nunito font-bold shadow-md hover:bg-secondary hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    Faire un don
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Actions & Menu button */}
                    <div className="lg:hidden flex items-center gap-2 sm:gap-4">
                        {isPortal ? (
                            <Link
                                href={portalLink}
                                className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 text-white font-nunito font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Mon Espace
                            </Link>
                        ) : (
                            <Link
                                href="/soutenir"
                                className="px-3 sm:px-4 py-2 rounded-xl bg-primary text-white font-nunito font-bold text-xs sm:text-sm shadow-md hover:bg-secondary transition-all active:scale-95"
                            >
                                Faire un don
                            </Link>
                        )}
                        <button
                            id="menu-toggle"
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 -mr-2 sm:p-3 sm:-mr-3 rounded-md text-dark hover:text-primary hover:bg-surface focus:outline-none transition-colors"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                        >
                            {isOpen ? <X size={28} className="w-6 h-6 sm:w-7 sm:h-7" /> : <Menu size={28} className="w-6 h-6 sm:w-7 sm:h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div
                id="mobile-menu"
                className={clsx(
                    "lg:hidden absolute top-20 left-0 w-full bg-background border-b border-primary/10 shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-top",
                    isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 invisible"
                )}
                inert={!isOpen}
            >
                <div className="px-4 py-4 space-y-2 flex flex-col">
                    <ul id="mobile-nav-menu" className="flex flex-col space-y-2">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={clsx(
                                        "nav-link block px-4 py-3 rounded-xl text-lg font-nunito font-bold",
                                        isActive(item.href) ? "bg-primary/10 text-primary" : "text-dark hover:bg-surface hover:text-primary"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4 mt-2 border-t border-primary/10">
                        {isPortal ? (
                            <div className="space-y-3">
                                <Link
                                    href={portalLink}
                                    className="block w-full text-center px-4 py-3 rounded-xl bg-emerald-600 text-white font-nunito font-bold text-lg shadow-md active:scale-95 transition-transform"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Accéder au Portail
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="block w-full text-center px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-nunito font-bold text-lg shadow-sm active:scale-95 transition-transform"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                            <Link
                                id="mobile-cta-link"
                                href="/soutenir"
                                className="block w-full text-center px-4 py-3 rounded-xl bg-primary text-white font-nunito font-bold text-lg shadow-md active:scale-95 transition-transform"
                                onClick={() => setIsOpen(false)}
                            >
                                Faire un don ❤️
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
