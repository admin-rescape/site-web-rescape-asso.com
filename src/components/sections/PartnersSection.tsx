import { getHighlightedPartners } from "@/actions/partners";
import Image from "next/image";
import { HandshakeIcon } from "lucide-react";

export const revalidate = 3600;

export default async function PartnersSection() {
    const partners = await getHighlightedPartners();

    if (partners.length === 0) return null;

    return (
        <section id="partners-section" className="py-16 md:py-20 bg-white border-t border-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-4">
                        <HandshakeIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Ils nous soutiennent</span>
                    </div>
                    <h2 className="font-pacifico text-3xl text-dark">Nos Partenaires</h2>
                    <p className="font-lato text-dark/60 mt-2 max-w-xl mx-auto">
                        Merci à tous ceux qui nous font confiance et soutiennent nos actions au quotidien.
                    </p>
                </div>

                <ul
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
                    role="list"
                    aria-label="Partenaires mis en avant"
                >
                    {partners.map((partner) => (
                        <li key={partner.id}>
                            {partner.link ? (
                                <a
                                    href={partner.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="partner-logo-link block grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                                    aria-label={partner.name}
                                >
                                    {partner.logo ? (
                                        <Image
                                            src={partner.logo}
                                            alt={partner.name}
                                            width={140}
                                            height={60}
                                            className="object-contain h-12 w-auto"
                                        />
                                    ) : (
                                        <div className="px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 font-playfair text-sm">
                                            {partner.name}
                                        </div>
                                    )}
                                </a>
                            ) : (
                                <div className="partner-logo grayscale opacity-50 flex items-center">
                                    {partner.logo ? (
                                        <Image
                                            src={partner.logo}
                                            alt={partner.name}
                                            width={140}
                                            height={60}
                                            className="object-contain h-12 w-auto"
                                        />
                                    ) : (
                                        <div className="px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-500 font-playfair text-sm">
                                            {partner.name}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
