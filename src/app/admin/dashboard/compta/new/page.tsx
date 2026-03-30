import { ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import ComptaForm from "./form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDirectionRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function NewComptaEntry() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/compta" className="p-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-emerald-600" />
                        Nouvelle Écriture
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Saisissez une recette, une dépense ou un don financier.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <ComptaForm />
            </div>
        </div>
    );
}
