"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createAction } from "@/app/admin/actions/actions";
import { Save, Loader2 } from "lucide-react";

export default function ActionForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await createAction(formData);
                router.push("/admin/dashboard/actions");
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Une erreur est survenue.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Titre *</label>
                <input type="text" id="title" name="title" required placeholder="Ex: Armoire Solidaire" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium" />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Description *</label>
                <textarea id="description" name="description" required rows={4} placeholder="Décrivez cette action solidaire en 2-3 phrases..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                    <label htmlFor="icon" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Icône (clé)</label>
                    <select id="icon" name="icon" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium">
                        <option value="warehouse">🏪 Armoire</option>
                        <option value="sprout">🌱 Potager</option>
                        <option value="handheart">🤝 Aide</option>
                        <option value="utensils">🍽️ Alimentaire</option>
                        <option value="graduation-cap">🎓 Éducation</option>
                        <option value="gift">🎁 Cadeau / Don</option>
                        <option value="palette">🎨 Créatif</option>
                        <option value="default">💡 Autre</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Statut</label>
                    <select id="status" name="status" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium">
                        <option value="En cours">En cours</option>
                        <option value="Permanente">Permanente</option>
                        <option value="Saisonnier">Saisonnier</option>
                        <option value="Ponctuel">Ponctuel</option>
                        <option value="Sur demande">Sur demande</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="periodicity" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Périodicité</label>
                    <input type="text" id="periodicity" name="periodicity" placeholder="Ex: Tous les mardis" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <input type="checkbox" id="isActive" name="isActive" defaultChecked className="w-4 h-4 accent-emerald-600" />
                <div>
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-800 cursor-pointer">Action active (visible sur le site)</label>
                    <p className="text-xs text-slate-500 mt-0.5">Si décoché, l&apos;action ne s&apos;affichera pas sur la page d&apos;accueil.</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Création...</> : <><Save className="w-5 h-5" /> Créer l&apos;action</>}
                </button>
            </div>
        </form>
    );
}
