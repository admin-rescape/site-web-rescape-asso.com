"use client";

import { createPartner } from "@/actions/partners";
import { Button } from "@/components/ui/Button";

export default function NewPartnerPage() {
    return (
        <div className="max-w-xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold font-pacifico text-primary">Ajouter un Partenaire</h1>

            <form action={async (formData) => { await createPartner(formData); }} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-primary/10">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark font-nunito">Nom du Partenaire</label>
                    <input
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Ex: Mairie d'Aniche"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark font-nunito">Lien Site Web (optionnel)</label>
                    <input
                        name="link"
                        type="url"
                        className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-dark font-nunito">Logo URL (optionnel)</label>
                    <input
                        name="logo"
                        className="w-full px-4 py-3 rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="https://..."
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" size="lg">
                        Ajouter
                    </Button>
                </div>
            </form>
        </div>
    );
}
