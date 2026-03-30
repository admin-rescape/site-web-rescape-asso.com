import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isDirectionRole } from "@/lib/roles";
import DonForm from "./form";

export const dynamic = "force-dynamic";

export default async function NouveauDonPage() {
    const session = await auth();
    if (!session?.user) redirect("/admin");

    const role = session.user.role as string;

    // For direction roles, they can register on behalf of any partner
    const partners = isDirectionRole(role)
        ? await prisma.user.findMany({
            where: { role: "PARTENAIRE" },
            select: { id: true, name: true, email: true, organizationName: true },
            orderBy: { name: "asc" }
        })
        : [];

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href={role === "PARTENAIRE" ? "/admin/dashboard/mes-dons" : "/admin/dashboard/dons"} className="p-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Package className="w-6 h-6 text-orange-500" />
                        Enregistrer un Don
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Déclarez un don physique reçu ou remis à l&apos;association.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <DonForm userId={session.user.id as string} partners={partners} isAdmin={isDirectionRole(role)} />
            </div>
        </div>
    );
}
