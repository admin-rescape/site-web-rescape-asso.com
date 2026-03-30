import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MailOpen, Send, Mail, Circle } from "lucide-react";
import MessageComposeForm from "./ComposeForm";
import MarkReadButton from "./MarkReadButton";

// --- Helpers ---

/**
 * Cached French locale date formatter. Constructed once at module level to avoid
 * rebuilding the expensive `Intl.DateTimeFormat` object on every render call.
 */
const frFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
});

/** Formats a date for French locale display. */
const formatDate = (date: Date): string => frFormatter.format(new Date(date));

export const dynamic = "force-dynamic";

// --- Types ---

type UserDetails = {
    name: string | null;
    email: string;
    organizationName: string | null;
};

type ContactUser = UserDetails & { id: string };

type ReceivedMessage = {
    id: string;
    subject: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
    from: UserDetails;
};

type SentMessage = {
    id: string;
    subject: string;
    createdAt: Date;
    to: UserDetails;
};

// --- Data Fetching Operations ---

/**
 * Fetch the user's received messages, ordered by creation date descending.
 */
async function getReceivedMessages(userId: string): Promise<ReceivedMessage[]> {
    return prisma.internalMessage.findMany({
        where: { toUserId: userId },
        orderBy: { createdAt: "desc" },
        take: 20, // bounded fetch — prevents unbounded memory use as the inbox grows
        include: { from: { select: { name: true, email: true, organizationName: true } } }
    });
}

/**
 * Returns the count of unread messages for a user directly from the database,
 * avoiding loading full message rows into memory just to call `.filter().length`.
 */
async function getUnreadCount(userId: string): Promise<number> {
    return prisma.internalMessage.count({
        where: { toUserId: userId, isRead: false }
    });
}

/**
 * Fetch the user's sent messages, ordered by creation date descending.
 */
async function getSentMessages(userId: string): Promise<SentMessage[]> {
    return prisma.internalMessage.findMany({
        where: { fromUserId: userId },
        orderBy: { createdAt: "desc" },
        include: { to: { select: { name: true, email: true, organizationName: true } } }
    });
}

/**
 * Fetch allowed contact profiles based on the user's role.
 * Admins communicate with partners, while partners communicate with admins.
 */
async function getContactUsers(isAdmin: boolean): Promise<ContactUser[]> {
    const targetRoles = isAdmin ? ["PARTENAIRE"] : ["SUPER_ADMIN", "DIRECTION"];

    return prisma.user.findMany({
        where: { role: { in: targetRoles } },
        select: { id: true, name: true, email: true, organizationName: true },
        orderBy: { name: "asc" }
    });
}

// --- UI Components ---

/**
 * Displays the page heading and indicates overall unread message count.
 */
function PageHeader({ unreadCount, isAdmin }: { unreadCount: number; isAdmin: boolean }) {
    return (
        <header className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-20 pointer-events-none"></div>
            <div className="relative z-10">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                    <MailOpen className="w-8 h-8 text-violet-600" />
                    Messagerie Interne
                    {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-7 h-7 bg-violet-600 text-white text-xs font-extrabold rounded-full animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Communication sécurisée {isAdmin ? "Direction ↔ Partenaires" : "avec l'association"}.
                </p>
            </div>
        </header>
    );
}

/**
 * Renders the form to compose new messages to authorized contacts.
 */
function ComposeMessageSection({ contacts }: { contacts: ContactUser[] }) {
    return (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-extrabold text-slate-700 flex items-center gap-2">
                    <Send className="w-4 h-4 text-violet-500" /> Nouveau message
                </h2>
            </div>
            <div className="p-6">
                <MessageComposeForm contacts={contacts} />
            </div>
        </section>
    );
}

/**
 * Displays an individual received message row.
 */
function ReceivedMessageRow({ message }: { message: ReceivedMessage }) {
    const senderIdentity = message.from.organizationName || message.from.name || message.from.email;
    const isUnread = !message.isRead;

    return (
        <article className={`px-6 py-4 transition-colors hover:bg-slate-50 ${isUnread ? "bg-violet-50/50" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    {isUnread && <Circle className="w-2 h-2 text-violet-600 fill-violet-600 flex-shrink-0 mt-1.5" />}
                    <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{message.subject}</p>
                        <p className="text-xs text-slate-500 mt-0.5">De : {senderIdentity}</p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{message.content}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(message.createdAt)}</p>
                    </div>
                </div>
                {isUnread && <MarkReadButton id={message.id} />}
            </div>
        </article>
    );
}

/**
 * Renders the inbox containing all received messages.
 */
function InboxSection({ messages, unreadCount }: { messages: ReceivedMessage[]; unreadCount: number }) {
    return (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-violet-500" />
                    Boîte de réception
                    {unreadCount > 0 && (
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
                        </span>
                    )}
                </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium">Aucun message reçu.</div>
                ) : (
                    messages.map(msg => <ReceivedMessageRow key={msg.id} message={msg} />)
                )}
            </div>
        </section>
    );
}

/**
 * Renders a single row in the sent messages history.
 */
function SentMessageRow({ message }: { message: SentMessage }) {
    const recipientIdentity = message.to.organizationName || message.to.name || message.to.email;
    return (
        <article className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors gap-4">
            <div>
                <p className="font-bold text-slate-700 text-sm">{message.subject}</p>
                <p className="text-xs text-slate-400">À : {recipientIdentity}</p>
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
                {formatDate(message.createdAt)}
            </div>
        </article>
    );
}

/**
 * Displays the sent messages history log. Returns null if empty.
 */
function OutboxSection({ messages }: { messages: SentMessage[] }) {
    if (messages.length === 0) return null;

    return (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-extrabold text-slate-700 flex items-center gap-2">
                    <Send className="w-4 h-4 text-slate-400" /> Messages envoyés ({messages.length})
                </h2>
            </div>
            <div className="divide-y divide-slate-100">
                {messages.map(msg => <SentMessageRow key={msg.id} message={msg} />)}
            </div>
        </section>
    );
}

// --- Main Page Component ---

/**
 * Internal Messaging Entry Point. 
 * Resolves session auth, orchestrates parallel data fetching, and renders layout.
 */
export default async function InternalMessagingPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/admin");

    const userId = session.user.id;
    const role = session.user.role as string;
    const isAdmin = ["SUPER_ADMIN", "DIRECTION"].includes(role);

    // Fetch all data in parallel to eliminate sequential waterfall latencies.
    // unreadCount is resolved via a lean DB count query instead of a client-side .filter().
    const [receivedMessages, sentMessages, availableContacts, unreadCount] = await Promise.all([
        getReceivedMessages(userId),
        getSentMessages(userId),
        getContactUsers(isAdmin),
        getUnreadCount(userId),
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader unreadCount={unreadCount} isAdmin={isAdmin} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ComposeMessageSection contacts={availableContacts} />
                <InboxSection messages={receivedMessages} unreadCount={unreadCount} />
            </div>

            <OutboxSection messages={sentMessages} />
        </div>
    );
}
