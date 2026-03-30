import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings, Globe, Plus, Trash2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { createSocialLink, deleteSocialLink, updateSocialLink } from "@/actions/social-links";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
        redirect("/admin/dashboard");
    }

    const socialLinks = await prisma.socialLink.findMany({ orderBy: { platform: "asc" } });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-indigo-600" />
                        Paramètres Globaux du Site
                    </h1>
                    <p className="text-slate-500 mt-2 text-base font-medium">
                        Réseaux sociaux, statistiques et contenu éditable de la vitrine publique.
                    </p>
                </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            Réseaux Sociaux
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Liens affichés dans le footer et les pages du site.</p>
                    </div>
                    <form action={async (formData: FormData) => {
                        "use server";
                        const platform = formData.get("platform") as string;
                        const url = formData.get("url") as string;
                        if (platform && url) await createSocialLink({ platform, url });
                    }}>
                        <div className="flex items-center gap-2 flex-wrap">
                            <select name="platform" required className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                                <option value="twitter">Twitter / X</option>
                                <option value="youtube">YouTube</option>
                                <option value="tiktok">TikTok</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                            <input name="url" type="url" required placeholder="https://..." className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm">
                                <Plus className="w-4 h-4" /> Ajouter
                            </button>
                        </div>
                    </form>
                </div>

                <div className="divide-y divide-slate-100">
                    {socialLinks.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-medium">
                            Aucun réseau social configuré. Ajoutez-en un ci-dessus.
                        </div>
                    ) : socialLinks.map((link) => (
                        <div key={link.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 capitalize">{link.platform}</p>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:underline flex items-center gap-1">
                                        {link.url.length > 50 ? link.url.slice(0, 50) + "…" : link.url}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <form action={async () => {
                                    "use server";
                                    await updateSocialLink(link.id, { isActive: !link.isActive });
                                }}>
                                    <button type="submit" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${link.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                        {link.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {link.isActive ? "Actif" : "Inactif"}
                                    </button>
                                </form>
                                <form action={async () => {
                                    "use server";
                                    await deleteSocialLink(link.id);
                                }}>
                                    <button type="submit" className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
