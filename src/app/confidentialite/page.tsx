export default function Confidentialite() {
    return (
        <div className="bg-background min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-pacifico text-primary mb-8 text-center">Politique de Confidentialité</h1>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/10 space-y-8 font-lato text-dark/80">
                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">1. Collecte des données</h2>
                        <p>
                            L&apos;association Rescape collecte des données personnelles (Nom, Email, Téléphone) uniquement via le formulaire de contact,
                            dans le seul but de répondre à vos demandes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">2. Utilisation des données</h2>
                        <p>
                            Vos données ne sont jamais vendues, louées ou cédées à des tiers. Elles sont conservées le temps nécessaire au traitement de votre demande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">3. Vos droits</h2>
                        <p>
                            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
                            Pour exercer ce droit, contactez-nous à : <a href="mailto:delaruevanessa48@gmail.com" className="text-primary hover:underline">delaruevanessa48@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
