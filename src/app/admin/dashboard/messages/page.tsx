import { prisma } from "@/lib/prisma";
import { Message } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isDirectionRole } from "@/lib/roles";

// Inline delete action for simplicity
async function deleteMessage(id: string) {
    "use server";
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }
    try {
        await prisma.message.delete({ where: { id } });
        revalidatePath("/admin/dashboard/messages");
    } catch (e) {
        console.error(e);
    }
}

export default async function MessagesPage() {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        redirect("/admin/dashboard");
    }

    const messages = await prisma.message.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-pacifico text-primary">Boîte de Réception</h1>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <p className="text-center text-dark/60 font-lato py-8">Aucun message reçu.</p>
                ) : (
                    messages.map((msg: Message) => (
                        <div key={msg.id} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-dark font-nunito">{msg.name || "Anonyme"}</h3>
                                    <p className="text-sm text-primary">{msg.email}</p>
                                    {msg.phone && <p className="text-xs text-dark/60">{msg.phone}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-dark/50">
                                        {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    <form action={deleteMessage.bind(null, msg.id)} className="mt-2">
                                        <button className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline">
                                            Supprimer
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="bg-beige/30 p-4 rounded-xl text-dark/80 font-lato italic">
                                &quot;{msg.content}&quot;
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
