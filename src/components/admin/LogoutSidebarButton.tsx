"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutSidebarButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Utilisation du signOut client-side pour garantir le nettoyage du cache NextAuth
            await signOut({ callbackUrl: "/" });
        } catch (error) {
            console.error("Erreur lors de la déconnexion", error);
            toast.error("Erreur lors de la déconnexion");
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold transition-all group border border-transparent hover:border-red-100 disabled:opacity-50"
        >
            <LogOut className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">
                {isLoading ? "Déconnexion..." : "Se déconnecter"}
            </span>
        </button>
    );
}
