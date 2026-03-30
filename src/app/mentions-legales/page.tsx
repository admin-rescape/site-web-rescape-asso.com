export default function MentionsLegales() {
    return (
        <div className="bg-background min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-pacifico text-primary mb-8 text-center">Mentions Légales</h1>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/10 space-y-8 font-lato text-dark/80">
                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">1. Conception et Réalisation</h2>
                        <p>
                            Ce site a été gracieusement conçu par <strong>Rachid CHON</strong>, bénévole de l&apos;association.<br />
                            Domicilié à Lourches 59156.<br />
                            Email : <a href="mailto:rchon@rchon-dev.fr" className="text-primary hover:underline">rchon@rchon-dev.fr</a><br />
                            Téléphone : 07.69.23.54.53
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">2. Édition et Direction de la publication</h2>
                        <p>
                            Le site est édité par l&apos;association <strong>Rescape</strong>, association loi 1901.<br />
                            Siège social : 4 Place Fogt, 59580 Aniche.<br />
                            Email : <a href="mailto:delaruevanessa48@gmail.com" className="text-primary hover:underline">delaruevanessa48@gmail.com</a><br />
                            Téléphone : 06.44.73.86.36<br /><br />
                            La directrice de la publication est <strong>Madame Vanessa Delarue</strong>, en sa qualité de Présidente de l&apos;association.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">3. Hébergement</h2>
                        <p>
                            Ce site est hébergé par [Nom de l&apos;hébergeur à compléter], [Adresse de l&apos;hébergeur].
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-playfair font-bold text-dark mb-4">4. Propriété intellectuelle</h2>
                        <p>
                            L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle.
                            Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
