"use client";

import { createEvent } from "@/actions/events";
import { Button } from "@/components/ui/Button";

export default function NewEventPage() {
    return (
        <div className="max-w-xl mx-auto space-y-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Créer un Événement</h1>

            <form action={async (formData) => { await createEvent(formData); }} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Titre de l&apos;événement</label>
                    <input
                        name="title"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Ex: Atelier Cuisine"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Date de début</label>
                        <input
                            name="start"
                            type="datetime-local"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">Date de fin (optionnel)</label>
                        <input
                            name="end"
                            type="datetime-local"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Lieu</label>
                    <input
                        name="location"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Ex: Salle des fêtes"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Détails de l&apos;événement..."
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                        Créer l&apos;événement
                    </Button>
                </div>
            </form>
        </div>
    );
}
