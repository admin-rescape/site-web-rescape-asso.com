import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { getLatestArticles } from "@/actions/articles";

export default async function NewsSection() {
    const latestNews = await getLatestArticles();

    if (latestNews.length === 0) return null;

    return (
        <section id="news-section" className="py-20 bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div id="news-header" className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="font-pacifico text-4xl text-primary mb-2">Actualités récentes</h2>
                        <p className="font-lato text-lg text-dark/70">Les dernières nouvelles de l&apos;association</p>
                    </div>
                    <Link
                        href="/actualites"
                        className="hidden md:inline-flex items-center text-primary font-bold hover:text-secondary transition-colors group"
                    >
                        Voir tout
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                </div>

                <ul id="news-grid" role="list" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {latestNews.map((news) => (
                        <li key={news.id}>
                            <article className="news-card bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-primary/5 flex flex-col group h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="news-card__category bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Actualité
                                    </span>
                                    <time
                                        className="news-card__date text-dark/40 text-sm flex items-center font-nunito"
                                        dateTime={news.publishedAt
                                            ? new Date(news.publishedAt).toISOString()
                                            : new Date(news.createdAt).toISOString()
                                        }
                                    >
                                        <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                                        {news.publishedAt
                                            ? new Date(news.publishedAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })
                                            : new Date(news.createdAt).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })
                                        }
                                    </time>
                                </div>
                                <h3 className="font-playfair text-xl font-bold text-dark mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                    {news.title}
                                </h3>
                                <p className="text-dark/70 text-sm mb-6 line-clamp-3 flex-grow">
                                    {news.excerpt || "Lire l'article pour en savoir plus..."}
                                </p>
                                <Link
                                    href={`/actualites/${news.slug || news.id}`}
                                    className="inline-flex items-center text-sm font-bold text-dark/60 hover:text-primary transition-colors mt-auto"
                                >
                                    Lire la suite
                                    <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" />
                                </Link>
                            </article>
                        </li>
                    ))}
                </ul>

                <div id="news-mobile-cta" className="mt-8 text-center md:hidden">
                    <Link
                        href="/actualites"
                        className="inline-flex items-center text-primary font-bold hover:text-secondary transition-colors"
                    >
                        Voir toutes les actualités
                        <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
