import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, MoreHorizontal, Briefcase } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDirectionRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function TeamAdminPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const members = await prisma.teamMember.findMany({
        orderBy: { order: "asc" },
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-600" />
                        Équipe Rescape
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez les membres du bureau et l'équipe affichée sur la page d'histoire.</p>
                </div>
                <Link href="/admin/dashboard/team/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Ajouter un Membre
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 rounded-tl-xl w-16 text-center">Ordre</th>
                                <th className="p-4">Identité</th>
                                <th className="p-4">Rôle</th>
                                <th className="p-4 text-right rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                                        Aucun membre d'équipe enregistré.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold font-mono">
                                                {member.order}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold uppercase overflow-hidden shrink-0">
                                                    {member.photo ? (
                                                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.name.charAt(0)
                                                    )}
                                                </div>
                                                <p className="font-semibold text-slate-800">{member.name}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold ring-1 ring-inset ring-indigo-500/20">
                                                <Briefcase className="w-3.5 h-3.5" /> {member.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/dashboard/team/${member.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
