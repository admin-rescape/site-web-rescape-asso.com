"use client";

import { useState } from "react";
import { createMission, deleteMission, updateMissionStatus } from "@/actions/missions";
import { toast } from "sonner";
import { Plus, Trash2, MapPin, Clock, CalendarIcon } from "lucide-react";
import type { Mission } from "@prisma/client";

const statusColors: Record<string, string> = {
    "A_FAIRE": "bg-slate-100 text-slate-600",
    "EN_COURS": "bg-blue-100 text-blue-700",
    "TERMINEE": "bg-emerald-100 text-emerald-700",
    "ANNULEE": "bg-red-100 text-red-700",
};

type UserAssignee = {
    name: string | null;
    email: string;
};

type StrippedUser = { id: string; name: string | null; email: string; role: string; organizationName: string | null; createdAt: Date; };
type MissionWithAssignee = Mission & { assignee?: UserAssignee };

export function MissionAdminClient({ initialMissions, benevoles }: { initialMissions: MissionWithAssignee[]; benevoles: StrippedUser[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        toast.loading("Création de la mission...");

        try {
            const res = await createMission(formData);
            if (res.error) throw new Error(res.error);
            toast.dismiss();
            toast.success("Mission assignée avec succès !");
            (e.target as HTMLFormElement).reset();
        } catch (err: unknown) {
            toast.dismiss();
            toast.error(err instanceof Error ? err.message : "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (typeof window === "undefined" || !window.confirm("Voulez-vous vraiment supprimer cette mission ?")) return;
        toast.loading("Suppression...", { id: `del-${id}` });
        try {
            const res = await deleteMission(id);
            if (res.error) throw new Error(res.error);
            toast.success("Mission supprimée !", { id: `del-${id}` });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Erreur de suppression", { id: `del-${id}` });
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        toast.loading("Mise à jour...", { id: `stat-${id}` });
        try {
            const res = await updateMissionStatus(id, newStatus);
            if (res.error) throw new Error(res.error);
            toast.success("Statut mis à jour !", { id: `stat-${id}` });
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Erreur de mise à jour", { id: `stat-${id}` });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-600" />
                        Nouvelle Mission
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Titre de la tâche *</label>
                            <input type="text" name="title" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Ex: Tri des vêtements" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                            <textarea name="description" rows={3} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Lieu</label>
                            <input type="text" name="location" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Local association" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                            <input type="date" name="date" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Heure de début</label>
                                <input type="time" name="startTime" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Heure de fin</label>
                                <input type="time" name="endTime" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Assigner à *</label>
                            <select name="assigneeId" required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                                <option value="">Choisir un bénévole...</option>
                                {benevoles.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.email})</option>
                                ))}
                            </select>
                        </div>
                        <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50">
                            Créer et Assigner
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {initialMissions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-500">Aucune mission assignée pour le moment.</p>
                    </div>
                ) : (
                    initialMissions.map(mission => (
                        <div key={mission.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-slate-800">{mission.title}</h3>
                                    <select
                                        value={mission.status}
                                        onChange={(e) => handleStatusUpdate(mission.id, e.target.value)}
                                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border-none focus:ring-0 ${statusColors[mission.status]}`}
                                    >
                                        <option value="A_FAIRE">À faire</option>
                                        <option value="EN_COURS">En cours</option>
                                        <option value="TERMINEE">Terminée</option>
                                        <option value="ANNULEE">Annulée</option>
                                    </select>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{mission.description}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-emerald-500" /> {new Date(mission.date).toLocaleDateString()}</span>
                                    {(mission.startTime || mission.endTime) && (
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> {mission.startTime || "?"} - {mission.endTime || "?"}</span>
                                    )}
                                    {mission.location && (
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {mission.location}</span>
                                    )}
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs">
                                        Assigné à : <strong>{mission.assignee?.name}</strong>
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(mission.id)} title="Supprimer" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
