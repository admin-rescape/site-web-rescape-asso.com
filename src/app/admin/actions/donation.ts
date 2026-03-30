"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isDirectionRole } from "@/lib/roles";

async function checkAuth() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    return session;
}

// Admin can register donations on behalf of any user (e.g., walk-in donation)
export async function createDonation(formData: FormData) {
    const session = await checkAuth();
    if (!isDirectionRole(session.user!.role as string)) {
        throw new Error("Unauthorized");
    }

    const userId = (formData.get("userId") as string) || (session.user!.id as string);

    await prisma.donation.create({
        data: {
            userId,
            donationType: formData.get("donationType") as string,
            quantity: parseFloat(formData.get("quantity") as string),
            unit: formData.get("unit") as string,
            date: new Date(formData.get("date") as string),
            notes: (formData.get("notes") as string) || null,
        }
    });

    revalidatePath("/admin/dashboard/dons");
    revalidatePath("/admin/dashboard/mes-dons");
    return { success: true };
}

export async function deleteDonation(id: string) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    await prisma.donation.delete({ where: { id } });
    revalidatePath("/admin/dashboard/dons");
    return { success: true };
}
