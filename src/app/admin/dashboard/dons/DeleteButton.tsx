"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDonation } from "@/app/admin/actions/donation";

export default function DonationDeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => {
                if (confirm("Supprimer ce don ?")) {
                    startTransition(async () => { await deleteDonation(id); });
                }
            }}
            disabled={isPending}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
