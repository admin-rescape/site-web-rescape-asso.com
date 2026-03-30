"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isDirectionRole } from "@/lib/roles";
import { accountingEntrySchema } from "@/lib/validations/accounting";

export async function createAccountingEntry(formData: FormData) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    const userId = session.user.id as string;
    if (!userId) throw new Error("Erreur de session : ID utilisateur manquant.");

    const rawData = {
        type: formData.get("type"),
        amount: parseFloat(formData.get("amount") as string),
        category: formData.get("category"),
        description: formData.get("description"),
        date: formData.get("date"),
    };

    const validated = accountingEntrySchema.safeParse(rawData);
    if (!validated.success) {
        throw new Error("Données invalides : vérifiez les champs");
    }

    await prisma.accountingEntry.create({
        data: {
            type: validated.data.type,
            amount: validated.data.amount,
            category: validated.data.category,
            description: validated.data.description,
            date: new Date(validated.data.date),
            createdById: userId
        }
    });

    revalidatePath("/admin/dashboard/compta");
    return { success: true };
}

export async function deleteAccountingEntry(id: string) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    await prisma.accountingEntry.delete({
        where: { id }
    });

    revalidatePath("/admin/dashboard/compta");
    return { success: true };
}
