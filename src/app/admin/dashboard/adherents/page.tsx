import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CreditCard, CheckCircle2, XCircle, Users, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import MembershipDeleteButton from "./DeleteButton";
import { isDirectionRole, isTresorier } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdherentsPage() {
    const session = await auth();
    if (!session || !isDirectionRole(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const readOnly = isTresorier(session.user?.role as string);

    const memberships = await prisma.membership.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
    });

    const totalPaid = memberships.filter(m => m.isPaid).length;
    const totalPending = memberships.filter(m => !m.isPaid).length;
    const totalAmount = memberships.filter(m => m.isPaid).reduce((s, m) => s + m.amountPaid, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-24 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-indigo-600" />
                        Adhérents & Cotisations
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestion des cartes annuelles (15€/an, facultatif).</p>
                </div>
                {!readOnly && (
                    <div className="relative z-10">
                        <Link href="/admin/dashboard/adherents/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter un adhérent
                        </Link>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Users className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Adhérents actifs</h3>
                    <p className="text-3xl font-extrabold text-slate-800">{memberships.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Cotisations payées</h3>
                    <p className="text-3xl font-extrabold text-emerald-600">{totalPaid} <span className="text-base font-medium text-slate-400">dont +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalAmount)}</span></p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><XCircle className="w-6 h-6" /></div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">En attente de paiement</h3>
                    <p className="text-3xl font-extrabold text-amber-500">{totalPending}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        Liste des Adhésions (Année glissante)
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Adhérent</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Validité</th>
                                <th className="px-6 py-4">N° Carte</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                                <th className="px-6 py-4 text-center">Statut</th>
                                {!readOnly && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {memberships.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                                        Aucun adhérent enregistré. Ajoutez le premier maintenant.
                                    </td>
                                </tr>
                            ) : memberships.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{m.user.name || "—"}</td>
                                    <td className="px-6 py-4 text-slate-500">{m.user.email}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {(() => {
                                            const endDate = new Date(m.createdAt);
                                            endDate.setFullYear(endDate.getFullYear() + 1);
                                            return `Jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.cardNumber ? (
                                            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">#{m.cardNumber}</span>
                                        ) : (
                                            <span className="text-slate-400 italic text-xs">Non attribué</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(m.amountPaid)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {m.isPaid ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Payé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                <XCircle className="w-3.5 h-3.5" /> En attente
                                            </span>
                                        )}
                                    </td>
                                    {!readOnly && (
                                        <td className="px-6 py-4 text-right">
                                            <MembershipDeleteButton id={m.id} />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
