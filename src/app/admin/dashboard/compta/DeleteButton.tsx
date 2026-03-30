"use client";

import { deleteAccountingEntry } from "@/app/admin/actions/compta";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir supprimer cette écriture ?")) {
                    startTransition(async () => {
                        await deleteAccountingEntry(id);
                    });
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
