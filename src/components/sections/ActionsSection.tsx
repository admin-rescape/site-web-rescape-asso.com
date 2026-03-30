import { HandHeart, Utensils, Sprout, Warehouse, Activity, GraduationCap, Gift, Palette } from "lucide-react";
import { ActionCard } from "@/components/ui/ActionCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveActions } from "@/actions/actions";
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

export const revalidate = 3600;

export default async function ActionsSection() {
    // Check if actions exist in DB, fallback to static defaults if not seeded
    let dbActions = await getActiveActions();

    if (dbActions.length === 0) {
        dbActions = [
            { id: "1", title: "Armoire et Boutique", description: "Donnez ce qui ne sert plus, servez-vous gratuitement ou à tout petit prix pour soutenir le fonctionnement du local.", icon: "warehouse", image: "/images/armoire.jpg", status: "Permanente", isActive: true, createdAt: new Date(), updatedAt: new Date(), periodicity: null },
            { id: "2", title: "Potager du Partage", description: "Un jardin collectif pour apprendre à cultiver et partager les récoltes ensemble.", icon: "sprout", image: "/images/potager.jpg", status: "Saisonnier", isActive: true, createdAt: new Date(), updatedAt: new Date(), periodicity: null },
            { id: "3", title: "Événements et Ateliers", description: "Noël solidaire, sorties, ateliers créatifs... Des moments pour se retrouver.", icon: "hand-heart", image: "/images/events.jpg", status: "Ponctuel", isActive: true, createdAt: new Date(), updatedAt: new Date(), periodicity: null },
            { id: "4", title: "Aide Alimentaire", description: "Distribution de sacs de nourriture pour soutenir les familles en difficulté.", icon: "utensils", image: "/images/aide.jpg", status: "Sur demande", isActive: true, createdAt: new Date(), updatedAt: new Date(), periodicity: null },
        ];
    }

    const mappedActions = dbActions.map(action => ({
        title: action.title,
        description: action.description,
        icon: iconMap[action.icon] || iconMap.default,
        image: action.image || "/images/placeholder.jpg",
        status: action.status as "En cours" | "Saisonnier" | "Ponctuel" | "Permanente" | "Sur demande" | undefined,
        periodicity: action.periodicity,
    }));

    return (
        <section id="actions-section" className="py-12 md:py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div id="actions-header" className="text-center mb-16">
                    <h2 className="font-pacifico text-4xl text-primary mb-4">Ce que nous faisons</h2>
                    <p className="font-lato text-xl text-dark/80 max-w-2xl mx-auto">
                        De l&apos;aide alimentaire au lien social, découvrez nos actions quotidiennes.
                    </p>
                </div>

                <ul id="actions-grid" role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {mappedActions.map((action, index) => (
                        <li key={index}>
                            <ActionCard {...action} />
                        </li>
                    ))}
                </ul>

                <div id="actions-footer" className="mt-12 text-center">
                    <Link
                        href="/actions"
                        className="inline-flex items-center text-primary font-bold text-lg hover:text-secondary p-3 -m-3 rounded-lg md:p-0 md:m-0 transition-colors group"
                    >
                        Découvrir toutes nos actions
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
