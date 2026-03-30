export const revalidate = 3600;

import { getHighlightedPartners } from "@/actions/partners";
import Image from "next/image";
import { HandshakeIcon } from "lucide-react";

export default async function PartenairesPage() {
    // For now we get highlighted partners, or all partners depending on what is needed
    // Assuming getHighlightedPartners gets the ones they want to show publicly
    const partners = await getHighlightedPartners();

    return (
        <div id="partenaires-page" className="bg-background min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro */}
                <section id="partenaires-intro" className="mb-16 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-4">
                        <HandshakeIcon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Ils nous font confiance</span>
                    </div>
                    <h1 className="text-5xl font-pacifico text-primary mb-4">Nos Partenaires</h1>
                    <p className="text-xl font-lato text-dark leading-relaxed max-w-2xl mx-auto">
                        Merci à toutes les entreprises, associations et institutions qui soutiennent nos actions au quotidien.
                    </p>
                </section>

                {/* Partners List */}
                {partners.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-slate-500 font-lato text-lg">Aucun partenaire n&apos;est mis en avant pour le moment.</p>
                    </div>
                ) : (
                    <ul
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12"
                        role="list"
                        aria-label="Liste de nos partenaires"
                    >
                        {partners.map((partner) => (
                            <li key={partner.id} className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                {partner.link ? (
                                    <a
                                        href={partner.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="partner-logo-link block grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300"
                                        aria-label={partner.name}
                                    >
                                        {partner.logo ? (
                                            <Image
                                                src={partner.logo}
                                                alt={partner.name}
                                                width={200}
                                                height={100}
                                                className="object-contain h-16 w-auto"
                                            />
                                        ) : (
                                            <div className="px-6 py-4 bg-slate-50 rounded-xl font-bold text-slate-600 font-playfair text-lg text-center">
                                                {partner.name}
                                            </div>
                                        )}
                                    </a>
                                ) : (
                                    <div className="partner-logo grayscale opacity-70 flex items-center justify-center">
                                        {partner.logo ? (
                                            <Image
                                                src={partner.logo}
                                                alt={partner.name}
                                                width={200}
                                                height={100}
                                                className="object-contain h-16 w-auto"
                                            />
                                        ) : (
                                            <div className="px-6 py-4 bg-slate-50 rounded-xl font-bold text-slate-600 font-playfair text-lg text-center">
                                                {partner.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
