import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageSquare, Send, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

async function sendPartnerMessage(formData: FormData) {
    "use server";
    const { auth: getAuth } = await import("@/auth");
    const session = await getAuth();
    if (!session?.user || session.user.role !== "PARTENAIRE") throw new Error("Non autorisé");
    const { prisma: db } = await import("@/lib/prisma");
    const { revalidatePath } = await import("next/cache");

    const subject = formData.get("subject") as string;
    const content = formData.get("content") as string;
    if (!subject?.trim() || !content?.trim() || content.trim().length < 10) {
        return;
    }

    await db.message.create({
        data: {
            name: (session.user as { organizationName?: string }).organizationName || session.user.name || "Partenaire",
            email: session.user.email || "partenaire@rescape.fr",
            subject: `[Partenaire] ${subject}`,
            content: content.trim(),
        },
    });

    revalidatePath("/admin/dashboard/messages-asso");
    revalidatePath("/admin/dashboard/messages");
}

export default async function MessagesAssoPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "PARTENAIRE") {
        redirect("/admin/dashboard");
    }

    // Get messages sent by this partner (matched by email)
    const sentMessages = await prisma.message.findMany({
        where: {
            email: session.user.email || "",
            subject: { startsWith: "[Partenaire]" },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-indigo-600" />
                        Communication avec l&apos;Asso
                    </h1>
                    <p className="text-slate-500 mt-2 text-base font-medium">
                        Envoyez un message à la direction de Rescape.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Send Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <Send className="w-5 h-5 text-indigo-500" />
                            Nouveau Message
                        </h2>
                    </div>
                    <form action={sendPartnerMessage} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objet</label>
                            <input
                                name="subject"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Ex: Demande de collecte, Retour sur l'action..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                            <textarea
                                name="content"
                                required
                                rows={6}
                                minLength={10}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                placeholder="Détaillez votre demande ou remarque..."
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            Envoyer le message
                        </button>
                    </form>
                </div>

                {/* Sent Messages History */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            Messages envoyés
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                        {sentMessages.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 font-medium">
                                Aucun message envoyé.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {sentMessages.map((msg) => (
                                    <div key={msg.id} className="p-5 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-bold text-slate-800 text-sm">
                                                {msg.subject?.replace("[Partenaire] ", "")}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-3">
                                                {msg.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2">{msg.content}</p>
                                        <div className="mt-2">
                                            {msg.read ? (
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">✓ Lu par la direction</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">En attente de lecture</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
