"use client";

import { deleteMembership } from "@/app/admin/actions/membership";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export default function MembershipDeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => {
                if (confirm("Supprimer cette adhésion ?")) {
                    startTransition(async () => { await deleteMembership(id); });
                }
            }}
            disabled={isPending}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
