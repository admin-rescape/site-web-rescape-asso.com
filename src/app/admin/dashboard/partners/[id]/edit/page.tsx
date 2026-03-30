import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartnerEditForm from "./form";

export const dynamic = "force-dynamic";

export default async function EditPartnerPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "DIRECTION", "DIRECTRICE"].includes(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const resolvedParams = await params;

    const partner = await prisma.partner.findUnique({
        where: { id: resolvedParams.id }
    });

    if (!partner) {
        redirect("/admin/dashboard/partners");
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/partners" className="p-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-amber-600" />
                        Modifier le partenaire
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Mettez à jour les informations de {partner.name}.</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <PartnerEditForm partner={partner} />
            </div>
        </div>
    );
}
