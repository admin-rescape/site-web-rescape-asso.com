"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { canManageUsers, isSuperAdmin, isValidRole } from "@/lib/roles";

export async function getUsers() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Action non autorisée");
    }
    const role = session.user.role as string;

    if (!canManageUsers(role)) {
        throw new Error("Action non autorisée");
    }

    return await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, organizationName: true, createdAt: true },
        orderBy: { createdAt: "desc" }
    });
}

export async function createUser(data: { name: string; email: string; role: string; organizationName?: string; password?: string }) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Action non autorisée");
    }
    const role = session.user.role as string;

    if (!canManageUsers(role)) {
        throw new Error("Action non autorisée");
    }

    if (data.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Seul un administrateur système peut créer un compte de type Super Admin");
    }

    if (!isValidRole(data.role)) {
        throw new Error("Rôle invalide");
    }

    if (!data.password || data.password.length < 8) {
        throw new Error("Un mot de passe d'au moins 8 caractères est requis");
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            role: data.role,
            organizationName: data.organizationName,
            password: hashedPassword,
        },
    });

    if (user.role === "PARTENAIRE") {
        await prisma.partner.create({
            data: {
                name: user.organizationName || user.name || "Nouveau Partenaire",
                userId: user.id
            }
        });
        revalidatePath("/admin/dashboard/partners");
    }

    revalidatePath("/admin/dashboard/users");
    return user;
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Action non autorisée");
    }
    const role = session.user.role as string;

    if (!canManageUsers(role)) {
        throw new Error("Action non autorisée");
    }

    // Protection anti-suicide : On ne peut pas supprimer son propre compte
    if (session.user.id === userId) {
        throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    }

    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToDelete) throw new Error("Utilisateur introuvable");

    if (userToDelete.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Le compte Super Admin est immuable et protégé");
    }

    // Prisma Cascade delete will handle the Partner deletion if setup correctly, 
    // but just to be safe and update cache:
    await prisma.user.delete({
        where: { id: userId },
    });

    revalidatePath("/admin/dashboard/users");
    if (userToDelete.role === "PARTENAIRE") {
        revalidatePath("/admin/dashboard/partners");
        revalidatePath("/partenaires");
    }
    return { success: true };
}

export async function updateUser(userId: string, data: { name?: string; email?: string; role?: string; organizationName?: string | null; password?: string }) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Action non autorisée");
    }
    const role = session.user.role as string;

    if (!canManageUsers(role)) {
        throw new Error("Action non autorisée");
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToUpdate) throw new Error("Utilisateur introuvable");

    if (userToUpdate.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Le compte Super Admin est immuable et protégé");
    }

    if (data.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
        throw new Error("Seul un administrateur système peut élever un utilisateur au rang de Super Admin");
    }

    if (data.role && !isValidRole(data.role)) {
        throw new Error("Rôle invalide");
    }

    const updateData: Record<string, string | null | undefined> = {
        name: data.name,
        email: data.email,
        role: data.role,
        organizationName: data.organizationName,
    };

    if (data.password && data.password.trim() !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });

    // Handle Partner auto-update/creation
    if (user.role === "PARTENAIRE") {
        const partnerName = user.organizationName || user.name || "Nouveau Partenaire";
        const existingPartner = await prisma.partner.findUnique({ where: { userId: user.id } });

        if (existingPartner) {
            await prisma.partner.update({
                where: { id: existingPartner.id },
                data: { name: partnerName }
            });
        } else {
            await prisma.partner.create({
                data: {
                    name: partnerName,
                    userId: user.id
                }
            });
        }
        revalidatePath("/admin/dashboard/partners");
        revalidatePath("/partenaires");
    }

    revalidatePath("/admin/dashboard/users");
    return user;
}

export async function changeMyPassword(currentPassword: string, newPassword: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Non autorisé");

    if (newPassword.length < 8) {
        return { error: "Le nouveau mot de passe doit faire au moins 8 caractères" };
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "Utilisateur introuvable" };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return { error: "Mot de passe actuel incorrect" };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return { success: true };
}
