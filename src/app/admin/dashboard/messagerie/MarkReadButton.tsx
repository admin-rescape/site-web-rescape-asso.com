"use client";

import { useTransition } from "react";
import { MailOpen } from "lucide-react";
import { markAsRead } from "@/app/admin/actions/messages";

export default function MarkReadButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => startTransition(async () => { await markAsRead(id); })}
            disabled={isPending}
            className="flex-shrink-0 p-1.5 text-violet-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
            title="Marquer comme lu"
        >
            <MailOpen className="w-4 h-4" />
        </button>
    );
}
