"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createMembership } from "@/app/admin/actions/membership";
import { Save, Loader2, Plus } from "lucide-react";

type User = { id: string; name: string | null; email: string };

export default function AdhérentForm({ users, currentYear }: { users: User[]; currentYear: number }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        if (isNewUser) formData.set("userId", "NEW");

        startTransition(async () => {
            try {
                await createMembership(formData);
                router.push("/admin/dashboard/adherents");
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

            {/* Choix du membre */}
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Adhérent</label>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setIsNewUser(false)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${!isNewUser ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'}`}>
                        Membre existant
                    </button>
                    <button type="button" onClick={() => setIsNewUser(true)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${isNewUser ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'}`}>
                        <Plus className="w-4 h-4" /> Nouveau
                    </button>
                </div>

                {!isNewUser ? (
                    <select name="userId" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium">
                        <option value="">— Sélectionnez un utilisateur —</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                        ))}
                    </select>
                ) : (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Nom complet *</label>
                            <input type="text" name="name" required placeholder="Prénom Nom" className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Email *</label>
                            <input type="email" name="email" required placeholder="email@exemple.fr" className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Téléphone</label>
                            <input type="tel" name="phone" placeholder="06 XX XX XX XX" className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium" />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                    <label htmlFor="year" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Année</label>
                    <input type="number" id="year" name="year" required defaultValue={currentYear} min={2020} max={2050} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="amountPaid" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Montant (€)</label>
                    <input type="number" step="0.01" min="0" id="amountPaid" name="amountPaid" required defaultValue="15.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="cardNumber" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">N° Carte</label>
                    <input type="text" id="cardNumber" name="cardNumber" placeholder="Ex: 2026-042" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <input type="checkbox" id="isPaid" name="isPaid" defaultChecked className="w-4 h-4 accent-indigo-600" />
                <div>
                    <label htmlFor="isPaid" className="text-sm font-bold text-slate-800 cursor-pointer">Cotisation payée</label>
                    <p className="text-xs text-slate-500 mt-0.5">Si coché, une ligne sera automatiquement créée dans la comptabilité.</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending}
                    className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={isPending}
                    className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer</>}
                </button>
            </div>
        </form>
    );
}
