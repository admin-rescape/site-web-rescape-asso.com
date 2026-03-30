import { getStats } from "@/actions/stats";
import { Counter } from "@/components/ui/Counter";

export default async function StatsSection() {
    const stats = await getStats();

    return (
        <section id="stats-section" className="py-12 md:py-20 bg-surface border-y border-primary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <dl id="stats-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item space-y-2 p-4 rounded-xl hover:bg-primary/5 transition-colors duration-300">
                            <dd className="stat-value text-4xl md:text-5xl font-bebas text-primary font-bold">
                                <Counter end={stat.value} suffix={stat.suffix || ""} />
                            </dd>
                            <dt className="stat-label text-dark/70 font-lato uppercase tracking-wider text-sm font-semibold">
                                {stat.label}
                            </dt>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
