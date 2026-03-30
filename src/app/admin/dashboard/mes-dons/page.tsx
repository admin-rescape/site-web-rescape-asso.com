import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Plus, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MesDonsPage() {
    const session = await auth();
    if (!session?.user) redirect("/admin");

    // The partner sees only their own donations
    const userId = session.user.id as string;

    const donations = await prisma.donation.findMany({
        where: { userId },
        orderBy: { date: "desc" }
    });

    const totalKg = donations.filter(d => d.unit === "KG").reduce((s, d) => s + d.quantity, 0);
    const totalPieces = donations.filter(d => d.unit === "PIECES").reduce((s, d) => s + d.quantity, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-emerald-600" />
                        Mes Dons & Contributions
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Retrouvez ici l&apos;historique complet de vos dons à l&apos;association.</p>
                </div>
                <Link href="/admin/dashboard/mes-dons/nouveau" className="relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Déclarer un don
                </Link>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Dons</p>
                    <p className="text-4xl font-extrabold text-slate-800">{donations.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Quantité (kg)</p>
                    <p className="text-4xl font-extrabold text-emerald-600">{totalKg.toFixed(1)}<span className="text-xl text-slate-400 ml-1">kg</span></p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Quantité (pièces)</p>
                    <p className="text-4xl font-extrabold text-blue-600">{totalPieces}<span className="text-xl text-slate-400 ml-1">pcs</span></p>
                </div>
            </div>

            {/* Liste des dons */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-extrabold text-slate-800">Historique de mes dons</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {donations.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Aucun don déclaré pour le moment.</p>
                            <Link href="/admin/dashboard/mes-dons/nouveau" className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
                                Déclarer mon premier don <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : donations.map((d) => (
                        <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{d.donationType.replace('_', ' ')}</p>
                                    <p className="text-sm text-slate-500">{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-slate-800">{d.quantity} {d.unit}</p>
                                {d.notes && <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{d.notes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
