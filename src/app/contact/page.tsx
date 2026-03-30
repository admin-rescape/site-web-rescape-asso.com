import ContactForm from "@/components/forms/ContactForm";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { OpeningStatus } from "@/components/ui/OpeningStatus";
import { Tooltip } from "@/components/ui/Tooltip";

export default function ContactPage() {
    return (
        <div id="contact-page" className="bg-background min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header id="contact-header" className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h1 className="text-5xl font-pacifico text-primary">Contactez-nous</h1>
                    <p className="text-xl text-dark/80 font-lato">
                        Une question ? Une envie de participer ? Besoin d&apos;aide ?<br />
                        Nous sommes là pour vous répondre.
                    </p>
                </header>

                <div id="contact-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-stretch">
                    {/* Contact Info */}
                    <aside id="contact-info-panel" className="flex flex-col space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/10 space-y-8">
                            <h2 className="text-3xl font-playfair font-bold text-dark">Nos Coordonnées</h2>

                            <address id="contact-address" className="not-italic space-y-6 font-lato text-lg">
                                <div className="contact-info-item flex items-start space-x-4">
                                    <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-bold text-dark">
                                            Adresse
                                            <Tooltip content="Dépôts autorisés uniquement pendant ces horaires à cette adresse." className="ml-1">
                                                <span className="text-primary cursor-help">*</span>
                                            </Tooltip> :
                                        </span>
                                        <p>4 Place Fogt<br />59580 Aniche</p>
                                    </div>
                                </div>

                                <div className="contact-info-item flex items-center space-x-4">
                                    <Phone className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-bold text-dark">Téléphone :</span>
                                        <p><a href="tel:0644738636" className="hover:text-primary transition-colors">06.44.73.86.36</a></p>
                                    </div>
                                </div>

                                <div className="contact-info-item flex items-center space-x-4">
                                    <Mail className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-bold text-dark">Email :</span>
                                        <p><a href="mailto:delaruevanessa48@gmail.com" className="hover:text-primary transition-colors">delaruevanessa48@gmail.com</a></p>
                                    </div>
                                </div>

                                <div className="contact-info-item flex items-start space-x-4 pt-4 border-t border-primary/10">
                                    <Clock className="w-6 h-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                                    <div className="w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                            <span className="font-bold text-dark text-xl">Horaires d&apos;ouverture</span>
                                            <OpeningStatus />
                                        </div>
                                        <ul className="space-y-3 text-base">
                                            {[
                                                { day: "Lundi", hours: "9h–11h / 14h–16h" },
                                                { day: "Mardi", hours: "9h–11h / 14h–16h" },
                                                { day: "Mercredi", hours: "Fermé", isClosed: true },
                                                { day: "Jeudi", hours: "9h–11h / 14h–16h" },
                                                { day: "Vendredi", hours: "9h–11h / 14h–16h" },
                                                {
                                                    day: (
                                                        <span>
                                                            Samedi
                                                            <Tooltip content="Ouvert uniquement les semaines paires." className="ml-1">
                                                                <span className="text-primary cursor-help">**</span>
                                                            </Tooltip>
                                                        </span>
                                                    ),
                                                    hours: "10h–12h / 14h–17h"
                                                },
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center border-b border-primary/5 pb-2">
                                                    <span className="font-semibold text-dark/70">{item.day}</span>
                                                    <span className={item.isClosed ? "text-red-500 font-medium italic" : "text-dark"}>
                                                        {item.hours}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </address>
                        </div>

                        {/* Map qui s'étire pour s'aligner */}
                        <figure id="contact-map" className="w-full flex-grow min-h-[300px] bg-surface rounded-2xl overflow-hidden shadow-sm border border-primary/10 relative">
                            <figcaption className="sr-only">Carte Google Maps – 4 Place Fogt, 59580 Aniche</figcaption>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2545.656512345678!2d3.2345678!3d50.3456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c2d123456789ab%3A0x123456789abcdef!2s4%20Pl.%20Fogt%2C%2059580%20Aniche!5e0!3m2!1sfr!2sfr!4v1620000000000!5m2!1sfr!2sfr"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                title="Localisation Rescape – 4 Place Fogt, Aniche"
                            ></iframe>
                        </figure>
                    </aside>

                    {/* Form */}
                    <section id="contact-form-panel" className="bg-white p-8 rounded-2xl shadow-lg border border-primary/5 flex flex-col h-full">
                        <ContactForm />
                    </section>
                </div>
            </div>
        </div>
    );
}
