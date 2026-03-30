import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/roles";
import ActionForm from "./form";

export const dynamic = "force-dynamic";

export default async function NewActionPage() {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/actions" className="p-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-600" />
                        Nouvelle Action
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Ajoutez une action qui sera affichée sur la page d&apos;accueil.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <ActionForm />
            </div>
        </div>
    );
}
