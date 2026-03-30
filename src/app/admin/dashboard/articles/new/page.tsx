"use client";

import { useState } from "react";
import { createArticle } from "@/actions/articles";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/editor/RichTextEditor"; // Adjust path if needed

export default function NewArticlePage() {
    const [content, setContent] = useState("<p>Écrivez votre article ici...</p>");

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Créer un nouvel article</h1>

            <form action={async (formData) => { await createArticle(formData); }} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Titre</label>
                    <input
                        name="title"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Titre de l&apos;actualité"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Extrait (optionnel)</label>
                    <textarea
                        name="excerpt"
                        rows={2}
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" name="published" id="published" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                    <label htmlFor="published" className="text-sm font-bold text-slate-700">Publier immédiatement</label>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                        Créer l&apos;article
                    </Button>
                </div>
            </form>
        </div>
    );
}
