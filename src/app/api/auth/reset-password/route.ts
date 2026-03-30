import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isPortalRole } from "@/lib/roles";

const ResetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
});

/**
 * POST /api/auth/reset-password
 * Réinitialise le mot de passe si le token est valide et non expiré.
 * Rate-limit : 10 tentatives / 15 minutes par IP.
 */
export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!rateLimit(`reset-password:${ip}`, { limit: 10, windowSec: 900 })) {
        return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const result = ResetSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }

        const { token, password } = result.data;
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await prisma.user.findFirst({
            where: {
                resetToken: tokenHash,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user || !isPortalRole(user.role)) {
            return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[reset-password] Error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
