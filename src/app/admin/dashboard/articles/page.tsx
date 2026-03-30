import { auth } from "@/auth";
import { isDirectionRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Article } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { deleteArticle } from "@/actions/articles";
import { redirect } from "next/navigation";
// Use client component for interactive parts if needed, but actions can be invoked via form
// For delete/toggle, we can use small client components or server actions via forms.

export default async function ArticlesPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const articles = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">Gestion des Actualités</h1>
                <Link href="/admin/dashboard/articles/new" className="relative z-10 w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                        Nouvel Article
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Titre</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Statut</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Date</th>
                                <th className="p-5 font-bold text-slate-500 text-[10px] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Aucun article pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                articles.map((article: Article) => (
                                    <tr key={article.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 font-bold text-slate-800 max-w-xs truncate">{article.title}</td>
                                        <td className="p-5">
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${article.published
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}
                                            >
                                                {article.published ? "Publié" : "Brouillon"}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm font-medium text-slate-500">
                                            {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="p-5 text-right space-x-2 whitespace-nowrap">
                                            <Link href={`/admin/dashboard/articles/${article.id}`}>
                                                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 transition-all font-semibold">
                                                    Modifier
                                                </Button>
                                            </Link>

                                            <form action={async () => { "use server"; await deleteArticle(article.id); }} className="inline-block">
                                                <Button variant="ghost" size="sm" className="rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-all">
                                                    Supprimer
                                                </Button>
                                            </form>
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
