import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Plus, AlertCircle, Weight, Box } from "lucide-react";
import DonationDeleteButton from "./DeleteButton";
import { isDirectionRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
    ALIMENTAIRE: { label: "Alimentaire", emoji: "🍎" },
    VETEMENTS: { label: "Vêtements", emoji: "👕" },
    JOUETS: { label: "Jouets", emoji: "🧸" },
    ELECTROMENAGER: { label: "Électroménager", emoji: "🏠" },
    AUTRE: { label: "Autre", emoji: "📦" },
};

export default async function DonsAdminPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const donations = await prisma.donation.findMany({
        orderBy: { date: "desc" },
        include: { user: { select: { name: true, email: true, organizationName: true } } }
    });

    const totalKg = donations.filter(d => d.unit === "KG").reduce((s, d) => s + d.quantity, 0);
    const totalPieces = donations.filter(d => d.unit === "PIECES").reduce((s, d) => s + d.quantity, 0);
    const totalCartons = donations.filter(d => d.unit === "CARTONS").reduce((s, d) => s + d.quantity, 0);

    const byType = Object.entries(
        donations.reduce((acc, d) => {
            acc[d.donationType] = (acc[d.donationType] || 0) + d.quantity;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute right-0 top-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-orange-500" />
                        Gestion des Dons Physiques
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {donations.length} don{donations.length > 1 ? "s" : ""} enregistré{donations.length > 1 ? "s" : ""} — suivi des quantités et types reçus.
                    </p>
                </div>
                <Link href="/admin/dashboard/dons/nouveau" className="relative z-10 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Enregistrer un don
                </Link>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total dons", value: donations.length, icon: <Package className="w-5 h-5" />, accent: "slate" },
                    { label: "En kg", value: `${totalKg.toFixed(0)} kg`, icon: <Weight className="w-5 h-5" />, accent: "orange" },
                    { label: "En pièces", value: `${totalPieces} pcs`, icon: <Box className="w-5 h-5" />, accent: "blue" },
                    { label: "En cartons", value: `${totalCartons} crt`, icon: <Box className="w-5 h-5" />, accent: "emerald" },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className={`text-${kpi.accent}-500 mb-2`}>{kpi.icon}</div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{kpi.label}</p>
                        <p className="text-2xl font-extrabold text-slate-800">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Répartition par type */}
            {byType.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-base font-extrabold text-slate-700 mb-4">Répartition par type</h2>
                    <div className="flex flex-wrap gap-3">
                        {byType.map(([type, qty]) => {
                            const meta = TYPE_LABELS[type] || { label: type, emoji: "📦" };
                            return (
                                <div key={type} className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                                    <span>{meta.emoji}</span>
                                    <span className="text-sm font-bold text-orange-700">{meta.label}</span>
                                    <span className="text-xs text-orange-500 font-medium">({qty.toFixed(0)})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-base font-extrabold text-slate-700">Historique complet</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4">Donateur</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Quantité</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {donations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-slate-400 font-medium">Aucun don enregistré.</p>
                                    </td>
                                </tr>
                            ) : donations.map((d) => {
                                const meta = TYPE_LABELS[d.donationType] || { label: d.donationType, emoji: "📦" };
                                return (
                                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{d.user?.organizationName || d.user?.name || d.donorName || "Anonyme"}</p>
                                            <p className="text-xs text-slate-400">{d.user?.email || "Donateur non inscrit"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                <span>{meta.emoji}</span> {meta.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            {d.quantity} <span className="text-slate-400 font-normal text-xs">{d.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate">
                                            {d.notes || <span className="italic">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DonationDeleteButton id={d.id} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
