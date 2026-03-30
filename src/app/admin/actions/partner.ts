"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { isDirectionRole } from "@/lib/roles";

export async function togglePartnerHighlight(id: string, isHighlighted: boolean) {
    const session = await auth();
    if (!session?.user || !isDirectionRole(session.user.role as string)) {
        throw new Error("Unauthorized");
    }

    await prisma.partner.update({
        where: { id },
        data: { isHighlighted }
    });

    revalidatePath("/admin/dashboard/partners");
    revalidatePath("/"); // Revalidate homepage to show updated partners
    revalidatePath("/partenaires"); // Revalidate the new public partners page
    return { success: true };
}
