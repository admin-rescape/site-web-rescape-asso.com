import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

import { isDirectionRole, isSuperAdmin, isTresorier } from "@/lib/roles";

const DEFAULT_REDIRECT = "/admin/dashboard";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role as string | undefined;
    const path = req.nextUrl.pathname;

    // Protection des routes par rôle (Matrice de Gouvernance)
    if (isLoggedIn && path.startsWith("/admin/dashboard")) {
        // Le SUPER_ADMIN n'a pas accès aux finances/métier
        const businessRoutes = ["/admin/dashboard/compta", "/admin/dashboard/adherents", "/admin/dashboard/partners", "/admin/dashboard/dons", "/admin/dashboard/calendrier-global"];
        if (isSuperAdmin(role) && businessRoutes.some(r => path.startsWith(r))) {
            return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
        }

        // La DIRECTION & TRESORIERE n'ont pas accès à la configuration système
        // Ils conservent cependant l'accès aux Utilisateurs (/admin/dashboard/users)
        const techRoutes = ["/admin/dashboard/settings"];
        if (isDirectionRole(role) && techRoutes.some(r => path.startsWith(r))) {
            return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
        }

        // La TRESORIERE : uniquement compta, adhérents (lecture), dons + fonctions bénévole
        // Bloquer explicitement les routes de création/édition interdites
        const tresorierBlockedRoutes = [
            "/admin/dashboard/adherents/new",
        ];
        if (isTresorier(role) && tresorierBlockedRoutes.some(r => path.startsWith(r))) {
            return Response.redirect(new URL("/admin/dashboard/adherents", req.nextUrl));
        }

        const tresorierRoutes = [
            "/admin/dashboard",
            "/admin/dashboard/compta",
            "/admin/dashboard/adherents",
            "/admin/dashboard/dons",
            "/admin/dashboard/calendrier-global",
            "/admin/dashboard/missions",
            "/admin/dashboard/calendrier",
            "/admin/dashboard/messagerie",
            "/admin/dashboard/profil",
        ];
        if (isTresorier(role) && !tresorierRoutes.some(r => path === r || path.startsWith(`${r}/`))) {
            return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
        }

        // Sécuriser les routes BENEVOLE
        const benevoleAllowed = ["/admin/dashboard", "/admin/dashboard/calendrier", "/admin/dashboard/messagerie", "/admin/dashboard/missions"];
        if (role === "BENEVOLE" && !benevoleAllowed.some(r => path === r || path.startsWith(`${r}/`))) {
            if (path !== "/admin/dashboard") {
                return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
            }
        }

        // Sécuriser les routes PARTENAIRE
        const partenaireAllowed = ["/admin/dashboard", "/admin/dashboard/mes-dons", "/admin/dashboard/messages-asso", "/admin/dashboard/messagerie"];
        if (role === "PARTENAIRE" && !partenaireAllowed.some(r => path === r || path.startsWith(`${r}/`))) {
            if (path !== "/admin/dashboard") {
                return Response.redirect(new URL("/admin/dashboard", req.nextUrl));
            }
        }
    }

    const isLoginPath = path.startsWith("/admin/login");
    const isAdminPath = path.startsWith("/admin") && !isLoginPath;
    if (isLoginPath) {
        if (isLoggedIn && role) {
            return Response.redirect(new URL(DEFAULT_REDIRECT, req.nextUrl));
        }
        return;
    }

    if (!isLoggedIn && isAdminPath) {
        return Response.redirect(new URL("/admin/login", req.nextUrl));
    }

    if (isLoggedIn && role) {
        // Keep authenticated users on the dashboard entry point.
        if (path === "/admin") {
            return Response.redirect(new URL(DEFAULT_REDIRECT, req.nextUrl));
        }
    } else if (isLoggedIn && !role && isAdminPath) {
        return Response.redirect(new URL("/", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
