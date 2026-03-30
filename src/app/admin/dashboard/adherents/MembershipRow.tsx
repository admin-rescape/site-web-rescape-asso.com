"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { createMembership } from "../../actions/membership";

type MembershipRowProps = {
    user: { id: string; name: string | null; email: string | null };
    membership: { id: string; isPaid: boolean; year: number } | null;
    currentYear: number;
};

export default function MembershipRow({ user, membership, currentYear }: MembershipRowProps) {
    const [isPending, startTransition] = useTransition();
    const [isPaid] = useState(membership?.isPaid || false);

    const handleCreate = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("userId", user.id);
            formData.append("year", currentYear.toString());
            formData.append("amountPaid", "15");
            formData.append("isPaid", "on");
            formData.append("cardNumber", "");

            try {
                await createMembership(formData);
            } catch (err) {
                console.error("Failed to create membership:", err);
            }
        });
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{user.name || "Bénévole Anonyme"}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
            </td>
            <td className="px-6 py-4">
                <span className="font-bold text-slate-700">{membership?.year || currentYear}</span>
            </td>
            <td className="px-6 py-4">
                {membership ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isPaid ? "Réglée (15€)" : "En attente"}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        <XCircle className="w-4 h-4" />
                        Non créé
                    </span>
                )}
            </td>
            <td className="px-6 py-4 text-right">
                {!membership && (
                    <button
                        onClick={handleCreate}
                        disabled={isPending}
                        className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                        + Créer &amp; Payer
                    </button>
                )}
            </td>
        </tr>
    );
}
