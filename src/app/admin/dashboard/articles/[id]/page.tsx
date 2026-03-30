"use client";

import { useState, useEffect } from "react";
import { updateArticle } from "@/actions/articles";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { notFound } from "next/navigation";

interface ArticleEditPageProps {
    params: Promise<{ id: string }>;
}

async function getArticle(id: string) {
    const res = await fetch(`/api/admin/articles/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
}

export default function EditArticlePage({ params }: ArticleEditPageProps) {
    const [article, setArticle] = useState<{
        id: string; title: string; content: string; excerpt?: string; image?: string; published: boolean;
    } | null>(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [articleId, setArticleId] = useState("");

    useEffect(() => {
        params.then(async (p) => {
            setArticleId(p.id);
            const data = await getArticle(p.id);
            if (data) {
                setArticle(data);
                setContent(data.content);
            }
            setLoading(false);
        });
    }, [params]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!article) return notFound();

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modifier l&apos;article</h1>

            <form
                action={async (formData) => {
                    await updateArticle(articleId, formData);
                }}
                className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Titre</label>
                    <input
                        name="title"
                        required
                        defaultValue={article.title}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Titre de l'actualité"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Extrait (optionnel)</label>
                    <textarea
                        name="excerpt"
                        rows={2}
                        defaultValue={article.excerpt ?? ""}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Un court résumé pour les cartes..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Contenu</label>
                    <RichTextEditor content={content} onChange={setContent} />
                    <input type="hidden" name="content" value={content} />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Image URL (optionnel)</label>
                    <input
                        name="image"
                        defaultValue={article.image ?? ""}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="published"
                        id="published"
                        defaultChecked={article.published}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="published" className="text-sm font-bold text-slate-700">Publié</label>
                </div>

                <div className="flex justify-between gap-4">
                    <a href="/admin/dashboard/articles" className="text-slate-500 hover:text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-200 transition-all">
                        Annuler
                    </a>
                    <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                        Enregistrer les modifications
                    </Button>
                </div>
            </form>
        </div>
    );
}
