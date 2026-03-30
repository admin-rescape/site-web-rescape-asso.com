"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SocialLinkData = {
    id: string;
    platform: string;
    url: string;
};

const platformIcons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
};

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();
    const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);

    useEffect(() => {
        fetch("/api/social-links")
            .then(res => res.json())
            .then((data: SocialLinkData[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setSocialLinks(data);
                }
            })
            .catch(() => {
                // Silently fail, keep empty
            });
    }, []);

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer id="site-footer" className="bg-dark text-surface pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 text-center md:text-left">

                    {/* Identity */}
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <Link href="/" className="font-pacifico text-3xl text-primary inline-block">
                            Rescape
                        </Link>
                        <p className="font-lato text-surface/80 leading-relaxed">
                            Lutte Anti Gaspillage Solidaire.<br />
                            Ensemble, rien ne se perd, tout se partage à Aniche.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <nav id="footer-nav" aria-label="Navigation secondaire" className="flex flex-col items-center md:items-start">
                        <h3 className="font-playfair text-xl text-accent font-bold mb-4">Navigation</h3>
                        <ul className="space-y-1 font-nunito w-full">
                            <li><Link href="/histoire" className="footer-nav-link block py-2 hover:text-primary transition-colors">Notre Histoire</Link></li>
                            <li><Link href="/actions" className="footer-nav-link block py-2 hover:text-primary transition-colors">Nos Actions</Link></li>
                            <li><Link href="/partenaires" className="footer-nav-link block py-2 hover:text-primary transition-colors">Nos Partenaires</Link></li>
                            <li><Link href="/evenements" className="footer-nav-link block py-2 hover:text-primary transition-colors">Événements</Link></li>
                            <li><Link href="/soutenir" className="footer-nav-link block py-2 hover:text-primary transition-colors">Devenir Partenaire</Link></li>
                        </ul>
                    </nav>

                    {/* Coordonnées */}
                    <address id="footer-address" className="space-y-4 not-italic flex flex-col items-center md:items-start">
                        <h3 className="font-playfair text-xl text-accent font-bold">Contact</h3>
                        <ul className="space-y-6 md:space-y-3 font-lato w-full">
                            <li className="footer-contact-item flex flex-col items-center md:flex-row md:space-x-3 text-center md:text-left">
                                <MapPin className="w-5 h-5 text-primary mb-2 md:mb-0 flex-shrink-0" aria-hidden="true" />
                                <span>4 Place Fogt<br />59580 Aniche</span>
                            </li>
                            <li className="footer-contact-item flex flex-col items-center md:flex-row md:space-x-3 text-center md:text-left">
                                <Phone className="w-5 h-5 text-primary mb-2 md:mb-0 flex-shrink-0" aria-hidden="true" />
                                <a href="tel:0644738636" className="block py-2 hover:text-white hover:underline decoration-primary">06.44.73.86.36</a>
                            </li>
                            <li className="footer-contact-item flex flex-col items-center md:flex-row md:space-x-3 text-center md:text-left">
                                <Mail className="w-5 h-5 text-primary mb-2 md:mb-0 flex-shrink-0" aria-hidden="true" />
                                <a href="mailto:delaruevanessa48@gmail.com" className="block py-2 hover:text-white hover:underline decoration-primary">delaruevanessa48@gmail.com</a>
                            </li>
                        </ul>
                    </address>

                    {/* Horaires & Réseaux */}
                    <section id="footer-hours" className="flex flex-col items-center md:items-start">
                        <h3 className="font-playfair text-xl text-accent font-bold mb-4">Horaires</h3>
                        <ul className="space-y-1 font-lato text-sm text-surface/80 w-full">
                            <li className="footer-hours-item"><span className="text-white font-bold">Lu, Ma, Je, Ve :</span> 9h-11h / 14h-16h</li>
                            <li className="footer-hours-item"><span className="text-white font-bold">Samedi (pair) :</span> 10h-12h / 14h-17h</li>
                            <li className="footer-hours-item pt-2 italic text-accent">* Fermé le Mercredi et Dimanche</li>
                        </ul>
                        <div id="footer-socials" className="flex justify-center md:justify-start space-x-4 pt-4">
                            {socialLinks.length > 0 ? (
                                socialLinks.map((link) => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link w-11 h-11 flex items-center justify-center rounded-full bg-surface/10 hover:bg-primary transition-colors"
                                        aria-label={link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                    >
                                        {platformIcons[link.platform] || <span className="text-xs font-bold uppercase">{link.platform.slice(0, 2)}</span>}
                                    </a>
                                ))
                            ) : (
                                <>
                                    <a href="#" className="social-link w-11 h-11 flex items-center justify-center rounded-full bg-surface/10 hover:bg-primary transition-colors" aria-label="Facebook">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="social-link w-11 h-11 flex items-center justify-center rounded-full bg-surface/10 hover:bg-primary transition-colors" aria-label="Instagram">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </>
                            )}
                        </div>
                    </section>
                </div>

                <div id="footer-bottom" className="border-t border-surface/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-lato text-surface/60">
                    <p>© {currentYear} Association Rescape. Tous droits réservés.</p>
                    <nav id="footer-legal-nav" aria-label="Liens légaux">
                        <ul className="flex flex-wrap gap-x-6 mt-4 md:mt-0 items-center justify-center md:justify-end">
                            <li><Link href="/mentions-legales" className="block py-2 hover:text-primary transition-colors">Mentions Légales</Link></li>
                            <li><Link href="/confidentialite" className="block py-2 hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li>
                                <Link href="/admin" className="flex items-center gap-2 py-2 hover:text-primary transition-colors " aria-label="Administration">
                                    <span className="hover:underline">Espace Admin</span>
                                    <span className="text-lg " aria-hidden="true">🔒</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
