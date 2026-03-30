import { updateMissionStatus } from "@/actions/missions";
import { toast } from "sonner";
import { MapPin, Clock, CalendarIcon, CheckCircle2 } from "lucide-react";
import type { Mission } from "@prisma/client";

const statusColors: Record<string, string> = {
    "A_FAIRE": "bg-slate-100 text-slate-600",
    "EN_COURS": "bg-blue-100 text-blue-700",
    "TERMINEE": "bg-emerald-100 text-emerald-700",
    "ANNULEE": "bg-red-100 text-red-700",
};

export function MissionBenevoleClient({ initialMissions }: { initialMissions: Mission[] }) {

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

    if (!initialMissions || initialMissions.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-white shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Toutes vos tâches sont accomplies !</h2>
                <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">
                    Aucune mission ne vous est actuellement assignée. La direction vous préviendra dès qu&apos;une nouvelle tâche sera disponible.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {initialMissions.map(mission => (
                <div key={mission.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-emerald-100 transition-colors">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl text-slate-800">{mission.title}</h3>
                        </div>
                        <p className="text-base text-slate-500 mb-4">{mission.description}</p>
                        <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-emerald-500" /> {new Date(mission.date).toLocaleDateString()}</span>
                            {(mission.startTime || mission.endTime) && (
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> {mission.startTime || "?"} - {mission.endTime || "?"}</span>
                            )}
                            {mission.location && (
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> {mission.location}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-1">Votre Avancement</span>
                        <select
                            value={mission.status}
                            onChange={(e) => handleStatusUpdate(mission.id, e.target.value)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-bold border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer ${statusColors[mission.status]}`}
                        >
                            <option value="A_FAIRE">À faire</option>
                            <option value="EN_COURS">En cours</option>
                            <option value="TERMINEE">Mission terminée</option>
                            <option value="ANNULEE">Annulée / Impossible</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}
