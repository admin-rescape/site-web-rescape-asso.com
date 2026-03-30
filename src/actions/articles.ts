"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/roles";
import { z } from "zod";

const ArticleSchema = z.object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    content: z.string().min(10, "Le contenu doit faire au moins 10 caractères"),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    published: z.boolean().optional(),
});

export async function createArticle(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        title: formData.get("title"),
        content: formData.get("content"),
        excerpt: formData.get("excerpt"),
        image: formData.get("image"),
        published: formData.get("published") === "on",
    };

    const validatedData = ArticleSchema.safeParse(rawData);

    if (!validatedData.success) {
        return { error: "Données invalides" };
    }

    const { title, content, excerpt, image, published } = validatedData.data;

    // Generate slug from title
    const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    try {
        await prisma.article.create({
            data: {
                title,
                slug: `${slug}-${Date.now()}`, // Ensure uniqueness
                content,
                excerpt,
                image,
                published: published || false,
                publishedAt: published ? new Date() : null,
            },
        });
    } catch {
        return { error: "Erreur lors de la création de l'article" };
    }

    revalidatePath("/admin/dashboard/articles");
    revalidatePath("/actualites");
    redirect("/admin/dashboard/articles");
}

export async function deleteArticle(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    try {
        await prisma.article.delete({ where: { id } });
        revalidatePath("/admin/dashboard/articles");
        revalidatePath("/actualites");
    } catch (error) {
        console.error("Delete error:", error);
        return { error: "Erreur lors de la suppression" };
    }
}

export async function toggleArticleStatus(id: string, currentStatus: boolean) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    try {
        await prisma.article.update({
            where: { id },
            data: {
                published: !currentStatus,
                publishedAt: !currentStatus ? new Date() : null
            },
        });
        revalidatePath("/admin/dashboard/articles");
        revalidatePath("/actualites");
    } catch (error) {
        console.error("Update error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
export async function updateArticle(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    const role = session.user.role as string;
    if (!hasAdminAccess(role)) {
        throw new Error("Action non autorisée");
    }

    const rawData = {
        title: formData.get("title"),
        content: formData.get("content"),
        excerpt: formData.get("excerpt"),
        image: formData.get("image"),
        published: formData.get("published") === "on",
    };

    const validatedData = ArticleSchema.safeParse(rawData);
    if (!validatedData.success) {
        return { error: "Données invalides" };
    }

    const { title, content, excerpt, image, published } = validatedData.data;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return { error: "Article introuvable" };

    try {
        await prisma.article.update({
            where: { id },
            data: {
                title,
                content,
                excerpt,
                image,
                published: published || false,
                publishedAt: published && !existing.publishedAt ? new Date() : existing.publishedAt,
            },
        });
    } catch {
        return { error: "Erreur lors de la mise à jour de l'article" };
    }

    revalidatePath("/admin/dashboard/articles");
    revalidatePath("/actualites");
    redirect("/admin/dashboard/articles");
}

export async function getLatestArticles() {
    try {
        const articles = await prisma.article.findMany({
            where: { published: true },
            orderBy: { publishedAt: "desc" }, // or createdAt
            take: 3,
        });
        return articles;
    } catch (error) {
        console.error("Error fetching latest articles:", error);
        return [];
    }
}
