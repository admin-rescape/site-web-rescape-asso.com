"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createTimelineEntry } from "@/actions/timeline";
import { Save, Loader2 } from "lucide-react";

export default function TimelineForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const res = await createTimelineEntry(formData);
                if (res?.error) throw new Error(res.error);
                router.push("/admin/dashboard/timeline");
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Une erreur est survenue.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Titre *</label>
                    <input type="text" id="title" name="title" required placeholder="Ex: Phase 6 - Nouveau Projet" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="caption" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Sous-titre (Optionnel)</label>
                    <input type="text" id="caption" name="caption" placeholder="Ex: Nouvelle dynamique" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="icon" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Émoji (Icône) *</label>
                    <input type="text" id="icon" name="icon" required placeholder="Ex: 🚀" defaultValue="✨" maxLength={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium text-center text-xl" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="order" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Ordre (Chronologie) *</label>
                    <input type="number" id="order" name="order" required min="1" defaultValue="6" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Contenu Narratif *</label>
                <textarea id="content" name="content" required rows={5} placeholder="Racontez l'histoire de cette période..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium resize-none" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer la période</>}
                </button>
            </div>
        </form>
    );
}
