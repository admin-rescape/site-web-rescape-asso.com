"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updatePartner } from "@/actions/partners";
import { Save, Loader2 } from "lucide-react";

export default function PartnerEditForm({ partner }: { partner: { id: string, name: string, link: string | null, logo: string | null } }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.append("id", partner.id);

        startTransition(async () => {
            try {
                const res = await updatePartner(formData);
                if (res?.error) throw new Error(res.error);
                router.push("/admin/dashboard/partners");
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
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Nom de l&apos;entreprise *</label>
                <input type="text" id="name" name="name" required defaultValue={partner.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 font-medium" />
            </div>

            <div className="space-y-2">
                <label htmlFor="link" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Site Web (URL)</label>
                <input type="url" id="link" name="link" defaultValue={partner.link || ""} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 font-medium" />
            </div>

            <div className="space-y-2">
                <label htmlFor="logo" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Logo (URL)</label>
                <input type="text" id="logo" name="logo" defaultValue={partner.logo || ""} placeholder="Lien vers l'image du logo..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 font-medium" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Annuler
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                    {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer les modifications</>}
                </button>
            </div>
        </form>
    );
}
