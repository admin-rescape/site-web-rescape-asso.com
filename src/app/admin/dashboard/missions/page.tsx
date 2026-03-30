import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { isDirectionRole, isSuperAdmin } from "@/lib/roles";
import { getMissionsForDirection, getMyMissions } from "@/actions/missions";
import { getUsers } from "@/actions/users";
import { MissionAdminClient } from "@/components/admin/MissionAdminClient";
import { MissionBenevoleClient } from "@/components/admin/MissionBenevoleClient";
import type { Mission } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function MissionsPage() {
    const session = await auth();
    if (!session?.user) redirect("/admin");

    const role = session.user.role as string;
    const isDirection = isDirectionRole(role) || isSuperAdmin(role);

    type MissionWithAssignee = Mission & { assignee?: { name: string | null; email: string } };
    type StrippedUser = { id: string; name: string | null; email: string; role: string; organizationName: string | null; createdAt: Date; };

    let missions: MissionWithAssignee[] = [];
    let benevoles: StrippedUser[] = [];

    if (isDirection) {
        missions = await getMissionsForDirection();
        const allUsers = await getUsers();
        // Filtrer pour n'afficher que les utilisateurs assignables (bénévoles uniquement)
        benevoles = allUsers.filter(u => u.role === "BENEVOLE");
    } else {
        missions = await getMyMissions();
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-amber-600" />
                            {isDirection ? "Gestion des Missions" : "Mes Missions"}
                        </h1>
                        <p className="text-slate-500 mt-2 text-base font-medium">
                            {isDirection
                                ? "Assignez et suivez les tâches de vos bénévoles."
                                : "Retrouvez ici vos tâches assignées et mettez à jour leur statut."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Render appropriate client component */}
            {isDirection ? (
                <MissionAdminClient initialMissions={missions} benevoles={benevoles} />
            ) : (
                <MissionBenevoleClient initialMissions={missions} />
            )}
        </div>
    );
}
