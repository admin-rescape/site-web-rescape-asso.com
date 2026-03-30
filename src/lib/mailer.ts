/**
 * @file mailer.ts
 * Transporteur Nodemailer agnostique au fournisseur SMTP.
 * En dev : utilise Ethereal (preview en console) si SMTP_HOST est absent.
 * En prod : configure les variables dans .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
 * NDD cible : contact@rescape.org (ou .fr — à confirmer).
 */
import nodemailer from "nodemailer";

/** Escape HTML special characters to prevent XSS in email templates. */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function createTransporter() {
    const host = process.env.SMTP_HOST;

    if (!host) {
        // Dev fallback : log dans la console, aucun email réel envoyé
        console.warn("[mailer] SMTP_HOST non configuré — mode console uniquement");
        return null;
    }

    return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true", // true pour port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export interface MailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM ?? "contact@rescape.org";

    if (!transporter) {
        // Mode dev — affiche le mail dans la console
        console.log("\n📬 [DEV MAIL] ──────────────────────────────");
        console.log(`From    : ${from}`);
        console.log(`To      : ${options.to}`);
        console.log(`Subject : ${options.subject}`);
        console.log(`Reply-To: ${options.replyTo ?? "—"}`);
        console.log("Body    :\n", options.html.replace(/<[^>]+>/g, ""));
        console.log("──────────────────────────────────────────\n");
        return;
    }

    await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
    });
}

/** Envoie un email de confirmation à l'expéditeur du formulaire de contact. */
export async function sendContactConfirmation(name: string, email: string): Promise<void> {
    const safeName = escapeHtml(name);
    await sendMail({
        to: email,
        subject: "✅ Votre message a bien été reçu — Association Rescape",
        html: `
            <p>Bonjour ${safeName},</p>
            <p>Nous avons bien reçu votre message et nous vous répondrons dans les meilleurs délais.</p>
            <p>L'équipe Rescape 🌱</p>
            <hr/>
            <small>Association Rescape — 4 Place Fogt, 59580 Aniche</small>
        `,
    });
}

/** Envoie la notification interne à l'association. */
export async function sendContactNotification(opts: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    content: string;
}): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.warn("[mailer] ADMIN_EMAIL non configuré — la notification de contact n'a pas pu être envoyée");
        return;
    }
    const safeName = escapeHtml(opts.name);
    const safeEmail = escapeHtml(opts.email);
    const safePhone = escapeHtml(opts.phone ?? "—");
    const safeSubject = escapeHtml(opts.subject ?? "—");
    const safeContent = escapeHtml(opts.content).replace(/\n/g, "<br/>");
    await sendMail({
        to: adminEmail,
        subject: `📩 Nouveau message — ${safeSubject}`,
        replyTo: opts.email,
        html: `
            <h2>Nouveau message via le formulaire de contact</h2>
            <table>
                <tr><td><strong>Nom :</strong></td><td>${safeName}</td></tr>
                <tr><td><strong>Email :</strong></td><td>${safeEmail}</td></tr>
                <tr><td><strong>Téléphone :</strong></td><td>${safePhone}</td></tr>
                <tr><td><strong>Objet :</strong></td><td>${safeSubject}</td></tr>
            </table>
            <h3>Message :</h3>
            <p>${safeContent}</p>
        `,
    });
}
