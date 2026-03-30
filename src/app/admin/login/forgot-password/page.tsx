"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Page Mot de passe oublié — profil [C] Association.
 * Étape 1 : saisir l'email. Affiche un message de confirmation (pas d'envoi réel
 * tant que le SMTP n'est pas configuré — le back-end log en dev).
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Une erreur est survenue.");
            } else {
                setSubmitted(true);
            }
        } catch {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Saisissez l&apos;adresse email associée à votre compte.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
                            <span className="text-3xl">✉️</span>
                        </div>
                        <p className="text-slate-700">
                            Si un compte existe avec cette adresse, vous recevrez un email
                            avec les instructions de réinitialisation.
                        </p>
                        <Link
                            href="/admin/login"
                            className="inline-block mt-4 text-sm font-medium text-primary hover:text-secondary transition-colors"
                        >
                            ← Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
                                Adresse email
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vanessa@rescape.org"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-900"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all disabled:opacity-50 shadow-md"
                        >
                            {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/admin/login"
                                className="text-sm text-slate-500 hover:text-primary transition-colors"
                            >
                                ← Retour à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
