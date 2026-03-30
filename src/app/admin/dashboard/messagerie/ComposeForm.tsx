"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { sendInternalMessage } from "@/app/admin/actions/messages";
import { Send, Loader2 } from "lucide-react";

type Contact = { id: string; name: string | null; email: string; organizationName: string | null };

export default function MessageComposeForm({ contacts }: { contacts: Contact[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const form = e.currentTarget;

        startTransition(async () => {
            try {
                await sendInternalMessage(formData);
                form.reset(); // reset only on success — preserves input if the action throws
                setSent(true);
                setTimeout(() => setSent(false), 3000);
                router.refresh();
            } catch (err: unknown) {
                setError((err as Error).message || "Erreur lors de l'envoi.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}
            {sent && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold">✅ Message envoyé !</div>}

            <div className="space-y-1.5">
                <label htmlFor="toUserId" className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Destinataire *</label>
                <select name="toUserId" id="toUserId" required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-slate-700 text-sm font-medium">
                    <option value="">— Sélectionnez —</option>
                    {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.organizationName || c.name || c.email}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Sujet *</label>
                <input type="text" id="subject" name="subject" required placeholder="Ex: Confirmation de don" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-slate-700 text-sm font-medium" />
            </div>

            <div className="space-y-1.5">
                <label htmlFor="content" className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Message *</label>
                <textarea id="content" name="content" required rows={5} placeholder="Votre message..." className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-slate-700 text-sm font-medium resize-none" />
            </div>

            <button type="submit" disabled={isPending} className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer</>}
            </button>
        </form>
    );
}
