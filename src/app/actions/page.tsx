import { ActionCard } from "@/components/ui/ActionCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { HandHeart, Utensils, Sprout, Warehouse, Activity, GraduationCap, Gift, Palette } from "lucide-react";

import { getActions } from "@/actions/actions";

const iconMap: Record<string, React.ReactNode> = {
    "warehouse": <Warehouse className="w-8 h-8 text-primary" />,
    "sprout": <Sprout className="w-8 h-8 text-secondary" />,
    "hand-heart": <HandHeart className="w-8 h-8 text-accent" />,
    "handheart": <HandHeart className="w-8 h-8 text-accent" />,
    "utensils": <Utensils className="w-8 h-8 text-dark" />,
    "graduation-cap": <GraduationCap className="w-8 h-8 text-primary" />,
    "gift": <Gift className="w-8 h-8 text-accent" />,
    "palette": <Palette className="w-8 h-8 text-secondary" />,
    "default": <Activity className="w-8 h-8 text-primary" />,
};

export default async function ActionsPage() {
    const actions = await getActions();

    return (
        <div id="actions-page" className="bg-background min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header id="actions-header" className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h1 className="text-5xl font-pacifico text-primary">Nos Actions</h1>
                    <p className="text-xl text-dark/80 font-lato">
                        Concrètement, Rescape c&apos;est ça : des projets simples mais essentiels pour aider, partager et préserver.
                    </p>
                </header>

                {/* Grid */}
                <ul id="actions-grid" role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {actions.map((action) => (
                        <li key={action.title}>
                            <ActionCard
                                title={action.title}
                                description={action.description}
                                icon={iconMap[action.icon] || action.icon || iconMap.default}
                                status={action.status as "En cours" | "Saisonnier" | "Ponctuel" | "Permanente" | "Sur demande"}
                            />
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <section id="actions-cta" className="bg-surface rounded-2xl p-12 text-center shadow-sm border border-primary/10 space-y-6">
                    <h2 className="text-3xl font-playfair font-bold text-dark">Vous voulez nous aider à agir ?</h2>
                    <p className="text-lg text-dark/70 font-lato max-w-2xl mx-auto">
                        Que ce soit par un don, du temps bénévole ou un partenariat, chaque geste nous permet d&apos;en faire plus.
                    </p>
                    <div className="pt-4">
                        <Link href="/soutenir">
                            <Button className="font-bold text-lg px-8 py-4 shadow-md hover:shadow-lg">
                                Soutenir nos actions
                            </Button>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
