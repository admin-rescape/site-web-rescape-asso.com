"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeamMember, deleteTeamMember } from "@/actions/team";
import { Save, Loader2, Trash2 } from "lucide-react";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    photo: string | null;
    bio: string | null;
    order: number;
}

export default function TeamMemberEditForm({ member }: { member: TeamMember }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const res = await updateTeamMember(member.id, formData);
                if (res?.error) throw new Error(res.error);
                router.push("/admin/dashboard/team");
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Une erreur est survenue.");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;
        setIsDeleting(true);
        startTransition(async () => {
            try {
                await deleteTeamMember(member.id);
                router.push("/admin/dashboard/team");
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Erreur lors de la suppression.");
                setIsDeleting(false);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Nom complet *</label>
                    <input type="text" id="name" name="name" required defaultValue={member.name} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Poste / Rôle *</label>
                    <input type="text" id="role" name="role" required defaultValue={member.role} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label htmlFor="order" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Ordre d&apos;affichage</label>
                    <input type="number" id="order" name="order" min="0" defaultValue={member.order} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="photo" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">URL Photo (optionnel)</label>
                    <input type="url" id="photo" name="photo" defaultValue={member.photo ?? ""} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium" />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Biographie (optionnel)</label>
                <textarea id="bio" name="bio" rows={4} defaultValue={member.bio ?? ""} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium resize-none" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
                <button type="button" onClick={handleDelete} disabled={isPending || isDeleting} className="px-5 py-3 rounded-xl font-bold bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-60">
                    <Trash2 className="w-4 h-4" /> Supprimer
                </button>
                <div className="flex gap-4">
                    <button type="button" onClick={() => router.back()} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
                        {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sauvegarde...</> : <><Save className="w-5 h-5" /> Enregistrer</>}
                    </button>
                </div>
            </div>
        </form>
    );
}
