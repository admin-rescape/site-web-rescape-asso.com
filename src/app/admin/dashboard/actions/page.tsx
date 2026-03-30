import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Activity, Plus, Edit2, CheckCircle2, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { toggleActionStatus } from "@/app/admin/actions/actions";
import DeleteActionTrigger from "./DeleteActionTrigger";
import { hasAdminAccess } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ActionsAdminPage() {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const actions = await prisma.action.findMany({
        orderBy: { createdAt: "asc" },
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-emerald-600" />
                        Actions Solidaires
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {actions.filter(a => a.isActive).length} active{actions.filter(a => a.isActive).length > 1 ? "s" : ""} sur {actions.length} — affichées sur la page d&apos;accueil.
                    </p>
                </div>
                <div className="relative z-10">
                    <Link href="/admin/dashboard/actions/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nouvelle Action
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4 w-16 text-center">Icône</th>
                                <th className="px-6 py-4">Titre & Description</th>
                                <th className="px-6 py-4">Périodicité</th>
                                <th className="px-6 py-4 text-center">Statut</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {actions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Aucune action. Créez la première avec le bouton ci-dessus.
                                    </td>
                                </tr>
                            ) : actions.map((action) => (
                                <tr key={action.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-2xl">{action.icon?.length <= 4 ? action.icon : "💡"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{action.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{action.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {action.periodicity || <span className="text-slate-300 italic">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <form action={async () => {
                                            "use server";
                                            await toggleActionStatus(action.id, !action.isActive);
                                        }}>
                                            <button type="submit" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${action.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                                {action.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {action.isActive ? "Actif" : "Inactif"}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        <Link href={`/admin/dashboard/actions/${action.id}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
                                            <Edit2 className="w-5 h-5" />
                                        </Link>
                                        <DeleteActionTrigger id={action.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
