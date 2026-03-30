import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const links = await prisma.socialLink.findMany({
        where: { isActive: true },
        orderBy: { platform: "asc" },
        select: { id: true, platform: true, url: true },
    });
    return NextResponse.json(links);
}
