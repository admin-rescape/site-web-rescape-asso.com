import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, Calendar, Wallet, FileText, ArrowUpRight, DollarSign } from "lucide-react";
import { redirect } from "next/navigation";
import { deleteAccountingEntry } from "@/app/admin/actions/compta";
import DeleteButton from "./DeleteButton";
import { isDirectionRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ComptaDashboard() {
    const session = await auth();
    if (!session || !isDirectionRole(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const entries = await prisma.accountingEntry.findMany({
        orderBy: { date: 'desc' },
        include: { createdBy: { select: { name: true } } }
    });

    const totalRecettes = entries.filter(e => e.type === "RECETTE").reduce((sum, e) => sum + e.amount, 0);
    const totalDepenses = entries.filter(e => e.type === "DEPENSE").reduce((sum, e) => sum + e.amount, 0);
    const soldeStr = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRecettes - totalDepenses);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-600" />
                        Comptabilité & Trésorerie
                    </h1>
                    <p className="text-slate-500 mt-2 text-base font-medium">Carnet de suivi des recettes, dépenses et dons perçus.</p>
                </div>
                <div className="relative z-10">
                    <Link href="/admin/dashboard/compta/new" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Ajouter une écriture
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Solde Actuel</h3>
                    <p className={`text-4xl font-extrabold ${(totalRecettes - totalDepenses) >= 0 ? "text-slate-900" : "text-red-600"}`}>
                        {soldeStr}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Recettes (Total)</h3>
                    <p className="text-3xl font-extrabold text-emerald-600">
                        +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRecettes)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Dépenses (Total)</h3>
                    <p className="text-3xl font-extrabold text-red-600">
                        -{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalDepenses)}
                    </p>
                </div>
            </div>

            {/* Historique Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Historique des écritures
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Catégorie</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">Aucune écriture comptable pour le moment.</td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                                            {new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{entry.description}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Saisi par {entry.createdBy.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                                {entry.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold">
                                            {entry.type === "RECETTE" ? (
                                                <span className="text-emerald-600">+{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.amount)}</span>
                                            ) : (
                                                <span className="text-red-600">-{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.amount)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DeleteButton id={entry.id} />
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
