"use client";

import { useState, useEffect } from "react";

/**
 * Bannière de consentement cookies RGPD — conforme profil [C] Association.
 * Stocke le choix dans localStorage. Ne bloque pas la navigation.
 * Registre : langage simple, chaleureux, FALC-adjacent.
 */
export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("rescape-cookie-consent");
        if (!consent) {
            // Délai court pour ne pas gêner le premier rendu
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    function accept() {
        localStorage.setItem("rescape-cookie-consent", "accepted");
        setVisible(false);
    }

    function decline() {
        localStorage.setItem("rescape-cookie-consent", "declined");
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-label="Consentement aux cookies"
            className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6"
        >
            <div className="mx-auto max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1 text-sm text-slate-700 leading-relaxed">
                    <p className="font-semibold text-slate-900 mb-1">🍪 Cookies & vie privée</p>
                    <p>
                        Ce site utilise uniquement des cookies essentiels pour son fonctionnement.
                        Aucune donnée n&apos;est partagée à des fins publicitaires.{" "}
                        <a
                            href="/confidentialite"
                            className="underline text-primary hover:text-secondary transition-colors"
                        >
                            En savoir plus
                        </a>
                    </p>
                </div>
                <div className="flex gap-3 shrink-0 w-full md:w-auto">
                    <button
                        onClick={decline}
                        className="flex-1 md:flex-initial px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Refuser
                    </button>
                    <button
                        onClick={accept}
                        className="flex-1 md:flex-initial px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-secondary rounded-xl transition-colors shadow-md"
                    >
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    );
}
