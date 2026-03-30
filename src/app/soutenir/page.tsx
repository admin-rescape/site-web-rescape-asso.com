import Link from "next/link";
import { HandHeart, PiggyBank, Package, Mail } from "lucide-react";

export default function SoutenirPage() {
    return (
        <div id="soutenir-page" className="bg-background min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header id="soutenir-header" className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h1 className="text-5xl font-pacifico text-primary">Nous Soutenir</h1>
                    <p className="text-xl text-dark/80 font-lato">
                        Chaque geste compte. Que ce soit du temps, des dons matériels ou une aide financière, votre soutien est notre moteur.
                    </p>
                </header>

                {/* Support Options Grid */}
                <ul id="support-cards" role="list" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {/* Don Financier */}
                    <li className="support-card bg-white p-8 rounded-2xl shadow-sm border border-primary/5 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                        <div className="support-card__icon w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6" aria-hidden="true">
                            <PiggyBank size={40} />
                        </div>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Faire un don financier</h2>
                        <p className="text-dark/70 mb-8 font-lato flex-grow">
                            Votre don permet de financer l&apos;achat de denrées, le loyer du local et les actions solidaires. Déductible des impôts à 66%.
                        </p>
                        <a
                            href="https://www.helloasso.com/associations/rescape"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary transition-all active:scale-95 transform hover:-translate-y-1 w-full shadow-md"
                        >
                            Faire un don sécurisé
                        </a>
                    </li>

                    {/* Don Matériel */}
                    <li className="support-card bg-white p-8 rounded-2xl shadow-sm border border-secondary/10 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                        <div className="support-card__icon w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-6" aria-hidden="true">
                            <Package size={40} />
                        </div>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Donner du matériel</h2>
                        <p className="text-dark/70 mb-8 font-lato flex-grow">
                            Vêtements, jouets, petits meubles, vaisselle... Ne jetez plus ! Déposez-les pour qu&apos;ils trouvent une seconde vie solidaire.
                        </p>
                        <Link
                            href="/contact"
                            className="bg-secondary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary/80 transition-all active:scale-95 transform hover:-translate-y-1 w-full shadow-md"
                        >
                            Voir où déposer
                        </Link>
                    </li>

                    {/* Bénévolat */}
                    <li className="support-card bg-white p-8 rounded-2xl shadow-sm border border-accent/10 hover:shadow-md transition-shadow text-center flex flex-col items-center">
                        <div className="support-card__icon w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-6" aria-hidden="true">
                            <HandHeart size={40} />
                        </div>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Devenir Bénévole</h2>
                        <p className="text-dark/70 mb-8 font-lato flex-grow">
                            Vous avez un peu de temps ? Rejoignez une équipe dynamique et chaleureuse pour trier, distribuer ou organiser des événements.
                        </p>
                        <Link
                            href="/contact#contact-form-panel"
                            className="bg-accent text-white font-bold py-3 px-8 rounded-xl hover:bg-accent/80 transition-all active:scale-95 transform hover:-translate-y-1 w-full shadow-md"
                        >
                            Rejoindre l&apos;équipe
                        </Link>
                    </li>
                </ul>

                {/* Partenariat */}
                <section id="partnership-cta" className="bg-dark text-surface rounded-2xl p-12 text-center shadow-lg relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl font-pacifico text-secondary">Entreprises & Partenaires</h2>
                        <p className="text-xl font-lato text-surface/80">
                            Vous êtes une entreprise, un commerçant ou une collectivité ?<br />
                            Construisons ensemble un projet porteur de sens pour le territoire.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="/contact?subject=partenariat"
                                className="inline-flex items-center gap-2 bg-white text-dark font-bold text-lg px-8 py-4 rounded-xl hover:bg-secondary hover:text-white transition-all active:scale-95 transform hover:-translate-y-1 shadow-md"
                            >
                                <Mail size={20} />
                                Nous contacter pour un partenariat
                            </Link>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" aria-hidden="true"></div>
                </section>

            </div>
        </div>
    );
}
