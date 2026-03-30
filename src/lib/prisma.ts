import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const isSqlite = dbUrl.startsWith("file:");

let prismaInstance: PrismaClient;

if (isSqlite) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

    const adapter = new PrismaBetterSqlite3({ url: dbUrl });

    prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
} else {
    // For PostgreSQL (Vercel / Supabase)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");

    // Keep the pool small: Vercel serverless functions spin up many instances,
    // each with their own pool. Supabase free tier allows ~25 total connections.
    const pool = new Pool({
        connectionString: dbUrl,
        max: 2,
        // Supabase (and most hosted PG) requires SSL — enforce it no matter
        // what the connection string says.
        ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);

    prismaInstance = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;


