import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Image as ImageIcon, Trash2, Plus, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDirectionRole } from "@/lib/roles";

export default async function MediaManagerPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    // Dans une version réelle, on listerait les fichiers sur S3 ou un dossier public.
    // Ici, on extrait les images utilisées dans les Articles et Événements pour donner une vue d'ensemble.
    const articles = await prisma.article.findMany({ select: { image: true, title: true } });
    const events = await prisma.event.findMany({ select: { image: true, title: true } });

    const media = [
        ...articles.filter(a => a.image).map(a => ({ url: a.image!, source: "Article", title: a.title })),
        ...events.filter(e => e.image).map(e => ({ url: e.image!, source: "Événement", title: e.title }))
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">Médiathèque</h1>
                    <p className="text-slate-500 mt-1 relative z-10">{media.length} fichiers utilisés sur le site</p>
                </div>
                <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-md transition-all active:scale-95">
                    <Plus size={18} />
                    Ajouter un média
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {media.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <p>Aucun média trouvé</p>
                    </div>
                ) : (
                    media.map((item, idx) => (
                        <div key={idx} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="aspect-square relative bg-slate-100 flex items-center justify-center overflow-hidden">
                                {item.url.startsWith("http") || item.url.startsWith("/") ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <ImageIcon size={32} className="text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform">
                                        <ExternalLink size={16} />
                                    </a>
                                    <button className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform cursor-not-allowed opacity-50">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{item.source}</p>
                                <p className="text-sm font-medium text-slate-800 truncate" title={item.title}>{item.title}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
