import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic"; // dynamic page, no static generation errors

interface PageProps {
    params: Promise<{ id: string }>; // URL passes slug into this id param
}

export default async function ArticlePage({ params }: PageProps) {
    const resolvedParams = await params;
    const article = await prisma.article.findUnique({
        where: { slug: resolvedParams.id }
    });

    if (!article || !article.published) {
        notFound();
    }

    return (
        <div className="bg-background min-h-screen py-16">
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    href="/actualites"
                    className="inline-flex items-center text-primary font-bold hover:text-secondary mb-8 transition-colors group"
                >
                    <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Retour aux actualités
                </Link>

                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center gap-4 text-sm text-dark/60 mb-4 font-nunito">
                        <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("fr-FR") : "Non publié"}
                        </span>
                        <span className="flex items-center gap-1 text-primary font-bold">
                            <Tag size={16} />
                            Actualité
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-6 leading-tight">
                        {article.title}
                    </h1>
                </header>

                {/* Banner Image */}
                <div className="relative w-full h-64 md:h-96 bg-secondary/20 rounded-2xl overflow-hidden mb-10 flex items-center justify-center border border-primary/10">
                    {article.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-pacifico text-3xl text-primary/40">Image: {article.title}</span>
                    )}
                </div>

                {/* Content */}
                <div
                    className="prose prose-lg prose-headings:font-playfair prose-p:font-lato prose-a:text-primary hover:prose-a:text-secondary max-w-none text-dark/80"
                    dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
                />
            </article>
        </div>
    );
}
