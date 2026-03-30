import { ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdhérentForm from "./form";

export const dynamic = "force-dynamic";

export default async function NewAdhérentPage() {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "DIRECTION"].includes(session.user?.role as string)) {
        redirect("/admin/dashboard");
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { role: "BENEVOLE" },
                { memberships: { some: {} } }
            ]
        },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" }
    });

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard/adherents" className="p-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                        Nouvel Adhérent
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Enregistrez une adhésion annuelle (15€ facultatifs).</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <AdhérentForm users={users} currentYear={new Date().getFullYear()} />
            </div>
        </div>
    );
}
