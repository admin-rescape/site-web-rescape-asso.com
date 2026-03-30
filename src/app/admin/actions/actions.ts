"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { hasAdminAccess } from "@/lib/roles";

async function checkDirectionAuth() {
    const session = await auth();
    if (!session?.user || !hasAdminAccess(session.user.role as string)) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function createAction(formData: FormData) {
    await checkDirectionAuth();

    await prisma.action.create({
        data: {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            icon: formData.get("icon") as string || "default",
            status: formData.get("status") as string || "En cours",
            periodicity: (formData.get("periodicity") as string) || null,
            isActive: formData.get("isActive") === "on",
        }
    });

    revalidatePath("/admin/dashboard/actions");
    revalidatePath("/");
    return { success: true };
}

export async function updateAction(id: string, formData: FormData) {
    await checkDirectionAuth();

    await prisma.action.update({
        where: { id },
        data: {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            icon: formData.get("icon") as string || "default",
            status: formData.get("status") as string || "En cours",
            periodicity: (formData.get("periodicity") as string) || null,
            isActive: formData.get("isActive") === "on",
        }
    });

    revalidatePath("/admin/dashboard/actions");
    revalidatePath("/");
    return { success: true };
}

export async function deleteAction(id: string) {
    await checkDirectionAuth();

    await prisma.action.delete({ where: { id } });

    revalidatePath("/admin/dashboard/actions");
    revalidatePath("/");
    return { success: true };
}

export async function toggleActionStatus(id: string, isActive: boolean) {
    await checkDirectionAuth();

    await prisma.action.update({
        where: { id },
        data: { isActive }
    });

    revalidatePath("/admin/dashboard/actions");
    revalidatePath("/");
    return { success: true };
}
