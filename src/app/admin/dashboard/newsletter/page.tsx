import { prisma } from "@/lib/prisma";
import { Newsletter } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Mail, UserMinus, Download } from "lucide-react";
import { unsubscribeNewsletter } from "@/actions/newsletter";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDirectionRole } from "@/lib/roles";

export default async function NewsletterAdminPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const subscribers: Newsletter[] = await prisma.newsletter.findMany({
        orderBy: { createdAt: "desc" },
    });

    const activeCount = subscribers.filter((s: Newsletter) => s.active).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">Newsletter</h1>
                    <p className="text-slate-500 mt-1 relative z-10">{activeCount} abonnés actifs sur {subscribers.length} inscriptions</p>
                </div>
                <div className="flex gap-2 relative z-10">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-700 font-semibold gap-2">
                        <Download size={18} />
                        Exporter CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Email</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Statut</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date d&apos;inscription</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Aucun abonné pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((sub: Newsletter) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 font-medium text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-slate-400" />
                                                {sub.email}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {sub.active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    Désabonné
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm text-slate-500">
                                            {new Date(sub.createdAt).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="p-5 text-right whitespace-nowrap">
                                            {sub.active && (
                                                <form action={async () => { "use server"; await unsubscribeNewsletter(sub.email); }}>
                                                    <Button variant="ghost" size="sm" className="rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-all gap-2">
                                                        <UserMinus size={16} />
                                                        Désabonner
                                                    </Button>
                                                </form>
                                            )}
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
