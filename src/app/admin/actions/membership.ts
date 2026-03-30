"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isDirectionRole } from "@/lib/roles";

export async function createMembership(formData: FormData) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    const userId = formData.get("userId") as string;
    let newUserId = userId;

    // Si on crée un nouvel utilisateur en même temps
        if (userId === "NEW") {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        if (!name || !email) throw new Error("Nom et Email requis pour un nouvel adhérent.");
        // Generate a strong random password, but keep the account without portal access.
        const randomPwd = crypto.randomBytes(32).toString('hex');
        const hash = await bcrypt.hash(randomPwd, 10);

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hash,
                    role: ""
                }
            });
        }
        newUserId = user.id;
    }

    const year = parseInt(formData.get("year") as string);
    const amountPaid = parseFloat(formData.get("amountPaid") as string);
    const isPaid = formData.get("isPaid") === "on";
    const cardNumber = (formData.get("cardNumber") as string) || null;

    if (!year) throw new Error("Année requise");

    const existing = await prisma.membership.findFirst({
        where: { userId: newUserId, year }
    });

    if (existing) {
        throw new Error(`Une adhésion existe déjà pour cet utilisateur et cette année (${year}).`);
    }

    await prisma.membership.create({
        data: { userId: newUserId, year, amountPaid, isPaid, cardNumber }
    });

    // Si cotisation payée → log comptabilité automatique
    if (isPaid && amountPaid > 0) {
        await prisma.accountingEntry.create({
            data: {
                type: "RECETTE",
                amount: amountPaid,
                category: "AUTRE",
                description: `Cotisation annuelle ${year} - ${cardNumber ? `Carte ${cardNumber}` : "Adhésion"}`,
                date: new Date(),
                createdById: session.user.id as string
            }
        });
    }

    revalidatePath("/admin/dashboard/adherents");
    revalidatePath("/admin/dashboard/compta");
    return { success: true };
}

export async function deleteMembership(id: string) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    await prisma.membership.delete({ where: { id } });

    revalidatePath("/admin/dashboard/adherents");
    return { success: true };
}
