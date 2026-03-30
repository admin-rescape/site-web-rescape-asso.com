"use client";

import { useState } from "react";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type Article = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    image: string | null;
};

// Assuming all articles loaded share the same general "news" category for now, or we can use another field.
// For backwards compatibility and filtering, we will treat 'category' as a fixed string "Actualité" or extract from tags if added in future.
// In the current schema, Article has no category field.

export default function ActualitesList({ articles }: { articles: Article[] }) {
    const [activeFilter, setActiveFilter] = useState("Tous");
    const categories = ["Tous", "Actualité"];

    const filteredArticles = activeFilter === "Tous"
        ? articles
        : articles; // No actual category filtering yet since schema doesn't have it

    return (
        <section id="actualites-list" className="py-12 px-4 sm:px-6 lg:px-8 bg-surface">
            <div className="max-w-7xl mx-auto">
                <nav id="articles-filter-nav" aria-label="Filtrer les articles" className="flex flex-wrap gap-2 justify-center mb-12">
                    {categories.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                "filter-btn px-4 py-2 rounded-full border border-primary/20 transition-colors font-nunito font-semibold",
                                activeFilter === filter
                                    ? "bg-primary text-white"
                                    : "text-dark hover:bg-primary/10"
                            )}
                            aria-pressed={activeFilter === filter}
                        >
                            {filter}
                        </button>
                    ))}
                </nav>

                {filteredArticles.length > 0 ? (
                    <ul id="articles-grid" role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article) => (
                            <li key={article.id}>
                                <article className="article-card bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-primary/5 flex flex-col h-full">
                                    <div className="relative h-48 w-full bg-secondary/20 overflow-hidden">
                                        {article.image ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-primary/40 font-pacifico text-xl" aria-hidden="true">
                                                Image: {article.title}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center gap-4 text-sm text-dark/60 mb-3 font-nunito">
                                            <time className="article-card__date flex items-center gap-1" dateTime={article.publishedAt?.toISOString()}>
                                                <Calendar size={14} aria-hidden="true" />
                                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : "Non publié"}
                                            </time>
                                            <span className="article-card__category flex items-center gap-1 text-primary">
                                                <Tag size={14} aria-hidden="true" />
                                                Actualité
                                            </span>
                                        </div>
                                        <h2 className="font-playfair text-xl font-bold text-dark mb-3 line-clamp-2">
                                            {article.title}
                                        </h2>
                                        <p className="text-dark/70 mb-6 flex-grow line-clamp-3">
                                            {article.excerpt}
                                        </p>
                                        <Link
                                            href={`/actualites/${article.slug}`}
                                            className="inline-flex items-center text-primary font-bold hover:text-secondary group"
                                        >
                                            Lire la suite
                                            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12 text-dark/60 font-lato text-lg" role="status">
                        Aucun article publié pour le moment.
                    </div>
                )}

                <nav id="articles-pagination" aria-label="Pagination" className="mt-16 flex justify-center space-x-2">
                    <button className="px-4 py-2 rounded-lg border border-primary/20 text-dark/60 hover:bg-surface disabled:opacity-50" disabled aria-disabled="true">
                        Précédent
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-primary text-white font-bold" aria-current="page">1</button>
                    <button className="px-4 py-2 rounded-lg border border-primary/20 text-dark hover:bg-surface" disabled aria-disabled="true">Suivant</button>
                </nav>
            </div>
        </section>
    );
}
