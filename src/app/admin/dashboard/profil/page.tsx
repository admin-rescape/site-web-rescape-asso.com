"use client";

import { useState } from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { changeMyPassword } from "@/actions/users";

export default function MonProfilPage() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (next !== confirm) {
            setStatus("error");
            setMessage("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        if (next.length < 8) {
            setStatus("error");
            setMessage("Le nouveau mot de passe doit faire au moins 8 caractères.");
            return;
        }

        setStatus("loading");
        try {
            const result = await changeMyPassword(current, next);
            if ("error" in result && result.error) {
                setStatus("error");
                setMessage(result.error);
            } else {
                setStatus("success");
                setMessage("Mot de passe modifié avec succès.");
                setCurrent(""); setNext(""); setConfirm("");
            }
        } catch {
            setStatus("error");
            setMessage("Erreur lors de la modification.");
        }
    }

    return (
        <div className="max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    Changer mon mot de passe
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Mot de passe actuel</label>
                        <input
                            type="password"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Nouveau mot de passe</label>
                        <input
                            type="password"
                            value={next}
                            onChange={(e) => setNext(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Au moins 8 caractères"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {message && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
                            status === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                            {status === "error"
                                ? <AlertCircle className="w-4 h-4 shrink-0" />
                                : <CheckCircle className="w-4 h-4 shrink-0" />}
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                    >
                        {status === "loading" ? "Enregistrement..." : "Changer le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}
