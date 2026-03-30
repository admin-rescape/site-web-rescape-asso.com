"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createDonation } from "@/actions/donations";
import { Save, Loader2 } from "lucide-react";

export default function AdminDonationForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const res = await createDonation(formData);
                if (res?.error) throw new Error(res.error);
                router.push("/admin/dashboard/dons");
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

            <div className="space-y-2">
                <label htmlFor="donorName" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Nom du donateur</label>
                <input type="text" id="donorName" name="donorName" placeholder="Ex: Jean Dupont (Laissez vide pour anonyme)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="donationType" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Type de don *</label>
                    <select id="donationType" name="donationType" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium">
                        <option value="ALIMENTAIRE">Alimentaire</option>
                        <option value="VETEMENTS">Vêtements</option>
                        <option value="JOUETS">Jouets</option>
                        <option value="ELECTROMENAGER">Électroménager</option>
                        <option value="AUTRE">Autre</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Date *</label>
                    <input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Quantité *</label>
                    <input type="number" step="0.1" min="0.1" id="quantity" name="quantity" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="unit" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Unité *</label>
                    <select id="unit" name="unit" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium">
                        <option value="KG">Kilogrammes (KG)</option>
                        <option value="PIECES">Pièces</option>
                        <option value="CARTONS">Cartons</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Notes additionnelles</label>
                <textarea id="notes" name="notes" rows={3} placeholder="Détails supplémentaires..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700 font-medium resize-none" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer le don</>}
                </button>
            </div>
        </form>
    );
}
