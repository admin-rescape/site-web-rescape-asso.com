import { prisma } from "@/lib/prisma";
import ActualitesList from "./ActualitesList";

export const revalidate = 3600; // 1 hour

export default async function ActualitesPage() {
    const dbArticles = await prisma.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" }
    });

    const articles = dbArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        publishedAt: a.publishedAt,
        image: a.image
    }));

    return (
        <div id="actualites-page" className="flex flex-col min-h-screen">
            {/* Hero */}
            <header id="actualites-header" className="bg-background py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="font-pacifico text-4xl md:text-5xl text-primary mb-6">
                        Actualités &amp; Vie de l&apos;Asso
                    </h1>
                    <p className="font-lato text-xl text-dark/80 max-w-2xl mx-auto">
                        Retrouvez ici les dernières actions, les événements passés et les histoires qui font vivre Rescape au quotidien.
                    </p>
                </div>
            </header>

            <ActualitesList articles={articles} />
        </div>
    );
}
