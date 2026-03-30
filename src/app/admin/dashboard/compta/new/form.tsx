"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createAccountingEntry } from "@/app/admin/actions/compta";
import { Save, Loader2 } from "lucide-react";

export default function ComptaForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                await createAccountingEntry(formData);
                router.push("/admin/dashboard/compta");
                router.refresh();
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="type" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Type d'opération</label>
                    <select id="type" name="type" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-medium font-sans">
                        <option value="RECETTE">Recette (Entrée d'argent)</option>
                        <option value="DEPENSE">Dépense (Sortie d'argent)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="amount" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Montant (€)</label>
                    <input type="number" step="0.01" min="0" id="amount" name="amount" required placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-bold font-sans" />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Catégorie</label>
                <select id="category" name="category" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-medium font-sans">
                    <option value="ACHAT">Achat de matériel / Fournitures</option>
                    <option value="LOYER">Loyer / Charges</option>
                    <option value="EVENEMENT">Frais d'Événements</option>
                    <option value="DON_RECU">Don Financier Reçu (Partenaire/Particulier)</option>
                    <option value="VENTE">Vente (Boutique Solidaire)</option>
                    <option value="AUTRE">Autre</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Date de l'opération</label>
                <input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-medium font-sans" />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Description / Libellé</label>
                <input type="text" id="description" name="description" required placeholder="Ex: Don de la Boulangerie XYZ" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 font-medium font-sans" />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    disabled={isPending}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Enregistrer l'écriture
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
