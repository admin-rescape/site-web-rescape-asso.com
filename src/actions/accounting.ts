"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { accountingEntrySchema } from "@/lib/validations/accounting";
import { revalidatePath } from "next/cache";
import { isDirectionRole } from "@/lib/roles";

export async function createAccountingEntry(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!isDirectionRole(role)) {
        throw new Error("Action non autorisée pour ce rôle");
    }

    const rawData = {
        type: formData.get("type"),
        amount: parseFloat(formData.get("amount") as string),
        category: formData.get("category"),
        description: formData.get("description"),
        date: formData.get("date"),
    };

    const validated = accountingEntrySchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Données invalides" };
    }

    await prisma.accountingEntry.create({
        data: {
            ...validated.data,
            date: new Date(validated.data.date),
            createdById: session.user.id!,
        },
    });

    revalidatePath("/admin/dashboard/compta");
    return { success: true };
}

export async function deleteAccountingEntry(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!isDirectionRole(role)) {
        throw new Error("Action non autorisée pour ce rôle");
    }

    await prisma.accountingEntry.delete({ where: { id } });
    revalidatePath("/admin/dashboard/compta");
    return { success: true };
}

export async function getAccountingEntries() {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!isDirectionRole(role)) {
        throw new Error("Action non autorisée pour ce rôle");
    }

    return await prisma.accountingEntry.findMany({
        orderBy: { date: "desc" },
        include: { createdBy: { select: { name: true } } }
    });
}
