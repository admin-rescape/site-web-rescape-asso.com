"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-600 font-semibold mb-4">Lien invalide ou manquant.</p>
                <Link href="/admin/login" className="text-primary underline">Retour à la connexion</Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) {
            setMessage("Les mots de passe ne correspondent pas.");
            setStatus("error");
            return;
        }
        if (password.length < 8) {
            setMessage("Le mot de passe doit faire au moins 8 caractères.");
            setStatus("error");
            return;
        }

        setStatus("loading");
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage("Mot de passe réinitialisé avec succès.");
                setTimeout(() => router.push("/admin/login"), 2000);
            } else {
                setStatus("error");
                setMessage(data.error ?? "Erreur lors de la réinitialisation.");
            }
        } catch {
            setStatus("error");
            setMessage("Erreur réseau. Réessayez.");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-dark mb-1">Nouveau mot de passe</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl border border-dark/20 focus:border-primary focus:ring-primary outline-none transition-all"
                    placeholder="Au moins 8 caractères"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-dark mb-1">Confirmer le mot de passe</label>
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-dark/20 focus:border-primary focus:ring-primary outline-none transition-all"
                    placeholder="Répétez le mot de passe"
                />
            </div>

            {message && (
                <p className={`text-sm font-semibold ${status === "error" ? "text-red-600" : "text-emerald-600"}`}>
                    {message}
                </p>
            )}

            <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {status === "loading" ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>

            <p className="text-center text-sm">
                <Link href="/admin/login" className="text-primary hover:text-secondary underline transition-colors">
                    Retour à la connexion
                </Link>
            </p>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-primary/10">
                    <h1 className="text-2xl font-playfair font-bold text-dark mb-2 text-center">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-dark/60 text-sm text-center mb-8">
                        Choisissez un nouveau mot de passe sécurisé.
                    </p>
                    <Suspense fallback={<div className="text-center text-dark/60">Chargement...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
