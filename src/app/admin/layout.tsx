import { auth } from "@/auth";
import Link from "next/link";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
    "SUPER_ADMIN": "Super Admin",
    "DIRECTION": "Direction",
    "DIRECTRICE": "Directrice",
    "TRESORIERE": "Trésorière",
    "BENEVOLE": "Bénévole",
    "PARTENAIRE": "Partenaire",
};

// Note: Roles checkers (`isDirectionRole`, `isSuperAdmin`) have been moved to components where they are needed.

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        return <div className="min-h-screen bg-slate-50">{children}</div>;
    }

    const role = session.user.role as string || "BENEVOLE";
    const label = roleLabels[role] || "Bénévole";

    // Nav Groups Config based on roles - NEW GOURVERNANCE MATRIX

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
            {/* Sidebar Desktop (Client Component) */}
            <AdminSidebar role={role} label={label} userName={session.user.name || "U"} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col h-screen">
                <AdminMobileNav role={role} label={label} userName={session.user.name || "U"} />
                <div className="p-6 md:p-10 flex-1 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto h-full flex flex-col">
                        <div className="flex-1">
                            {children}
                        </div>
                        {/* Admin Footer */}
                        <footer className="mt-12 pt-6 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
                            <p>© {new Date().getFullYear()} Association Rescape Aniche. Tous droits réservés.</p>
                            <div className="flex gap-4">
                                <Link href="#" className="hover:text-emerald-600 transition-colors">Support technique</Link>
                                <Link href="#" className="hover:text-emerald-600 transition-colors">Documentation interne</Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}
