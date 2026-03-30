"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createDonation } from "@/app/admin/actions/donation";
import { Save, Loader2 } from "lucide-react";

type Partner = { id: string; name: string | null; email: string; organizationName: string | null };

export default function DonForm({ userId, partners, isAdmin }: { userId: string; partners: Partner[]; isAdmin: boolean }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        if (!isAdmin) formData.set("userId", userId);

        startTransition(async () => {
            try {
                await createDonation(formData);
                router.push(isAdmin ? "/admin/dashboard/dons" : "/admin/dashboard/mes-dons");
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Une erreur est survenue.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

            {isAdmin && partners.length > 0 && (
                <div className="space-y-2">
                    <label htmlFor="userId" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Partenaire</label>
                    <select name="userId" id="userId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium">
                        <option value="">— Sélectionnez un partenaire —</option>
                        {partners.map(p => (
                            <option key={p.id} value={p.id}>{p.organizationName || p.name || p.email}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="donationType" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Type de don *</label>
                    <select id="donationType" name="donationType" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium">
                        <option value="ALIMENTAIRE">🍎 Alimentaire</option>
                        <option value="VETEMENTS">👕 Vêtements</option>
                        <option value="JOUETS">🧸 Jouets</option>
                        <option value="ELECTROMENAGER">🏠 Électroménager</option>
                        <option value="AUTRE">📦 Autre</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="date" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Date du don *</label>
                    <input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-bold" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Quantité *</label>
                    <input type="number" step="0.1" min="0" id="quantity" name="quantity" required placeholder="Ex: 15" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-bold text-xl" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="unit" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Unité *</label>
                    <select id="unit" name="unit" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium">
                        <option value="KG">Kg</option>
                        <option value="PIECES">Pièces</option>
                        <option value="CARTONS">Cartons</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Notes (facultatif)</label>
                <textarea id="notes" name="notes" rows={3} placeholder="Détails sur ce don..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium resize-none" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                    Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600 shadow-md flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer le don</>}
                </button>
            </div>
        </form>
    );
}
