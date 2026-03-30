import Timeline from "@/components/sections/Timeline";
import { Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // ISR cache (1 hour)

export default async function HistoirePage() {
    const timelineEntries = await prisma.timelineEntry.findMany({
        orderBy: { order: "asc" }
    });

    const teamMembers = await prisma.teamMember.findMany({
        orderBy: { order: "asc" }
    });

    const timelineItems = timelineEntries.length > 0 ? timelineEntries.map((entry) => ({
        title: entry.title,
        icon: entry.icon,
        children: (
            <>
                <p className="font-lato leading-relaxed text-dark/80">{entry.content}</p>
                {entry.caption && (
                    <p className="mt-2 font-pacifico text-secondary text-base md:text-lg">
                        {entry.caption}
                    </p>
                )}
            </>
        ),
    })) : [
        {
            title: "Phase 1 - \"Du Cœur à la Couture\"",
            icon: "😷",
            children: (
                <p className="font-lato leading-relaxed text-dark/80">Un masque cousu par amour devient le point de départ. La chaîne de masques commence simplement, motivée par la peur de perdre à nouveau. Du tissu élastique arrive sur une palette, le premier pas vers l&apos;aide collective.</p>
            )
        },
        {
            title: "Phase 2 - \"Quand l'Aide Frappe à la Porte\"",
            icon: "🍱",
            children: (
                <p className="font-lato leading-relaxed text-dark/80">Un monsieur en difficulté apporte ses soucis de nourriture. L&apos;association s&apos;élargit naturellement au-delà des masques. Un sac de nourriture rejoint la palette : ReScape devient multifonctionnel.</p>
            )
        },
        {
            title: "Phase 3 - \"De la Rue à la Légalité\"",
            icon: "⚖️",
            children: (
                <p className="font-lato leading-relaxed text-dark/80">Les armoires débordent du trottoir. Pour continuer sans déranger, ils doivent se structurer. Nait alors la nécessité de transformer une belle action citoyenne en association officielle, inscrite dans les règles.</p>
            )
        },
        {
            title: "Phase 4 - \"L'Armoire Grandit, Les Rêves S'Envolent\"",
            icon: "🧺",
            children: (
                <p className="font-lato leading-relaxed text-dark/80">L&apos;association se crée avec une armoire encore plus grande. Les actions se multiplient : événements scolaires, noël, potager partagé. ReScape devient un véritable hub communautaire au cœur d&apos;Aniche.</p>
            )
        },
        {
            title: "Phase 5 - \"Trouver Sa Maison\"",
            icon: "🏠",
            children: (
                <p className="font-lato leading-relaxed text-dark/80">Après l&apos;ampleur, vient la responsabilité. L&apos;association se stabilise au local, s&apos;organise contre le gaspillage et cherche des partenaires. ReScape grandit, mais reste accessible et à l&apos;écoute.</p>
            )
        }
    ];

    // Fallback static data if DB is empty
    const displayTeam: { id: string; name: string; role: string }[] = teamMembers.length > 0
        ? teamMembers.map(m => ({ id: m.id, name: m.name, role: m.role }))
        : [
            { id: "fallback-1", name: "Vanessa Delarue", role: "Présidente" },
            { id: "fallback-2", name: "Nicolas Delarue", role: "Vice-Président" },
            { id: "fallback-3", name: "Nadia Bennaceur", role: "Trésorière" },
            { id: "fallback-4", name: "Sandrine Laruelle", role: "Secrétaire" },
        ];

    return (
        <div id="histoire-page" className="bg-background min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro */}
                <section id="histoire-intro" className="mb-16 text-center space-y-6">
                    <h1 className="text-5xl font-pacifico text-primary mb-4">Notre Histoire</h1>
                    <p className="text-xl font-lato text-dark leading-relaxed max-w-2xl mx-auto italic">
                        &quot;Tout a commencé par un masque cousu à la main.&quot;
                    </p>
                </section>

                {/* Timeline */}
                {timelineItems.length > 0 && (
                    <section id="histoire-timeline" className="mb-20">
                        <Timeline items={timelineItems} />
                    </section>
                )}

                {/* Quote */}
                <section id="fondatrice-quote" className="bg-surface p-8 rounded-2xl shadow-sm border border-primary/10 relative overflow-hidden text-center mb-16">
                    <Quote className="absolute top-4 left-4 text-primary/10 w-16 h-16 rotate-180" aria-hidden="true" />
                    <blockquote className="relative z-10 space-y-4">
                        <p className="font-lato text-2xl font-bold text-dark">
                            &quot;Nous avons tenu à rester ouverts à tous — et nous le resterons.&quot;
                        </p>
                        <footer className="font-lato font-semibold text-primary">
                            — Vanessa Delarue, Présidente
                        </footer>
                    </blockquote>
                </section>

                {/* Team */}
                <section id="equipe-section" className="text-center space-y-8">
                    <h2 className="text-3xl font-pacifico text-primary">L&apos;équipe</h2>
                    <ul id="team-grid" className="flex flex-wrap justify-center gap-6" role="list">
                        {displayTeam.map((member) => (
                            <li key={member.id} className="team-card flex-1 min-w-[250px] max-w-[300px] bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="team-card__avatar w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl" aria-hidden="true">
                                    👤
                                </div>
                                <h3 className="font-bold text-dark font-lato">{member.name}</h3>
                                <p className="text-secondary font-lato text-sm">{member.role}</p>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </div>
    );
}
