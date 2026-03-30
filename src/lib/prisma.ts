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

    // Transaction mode pooler (port 6543): PgBouncer multiplexes connections
    // per query/transaction, so max:1 per serverless instance is sufficient
    // and avoids hitting Supabase free-tier pool_size limits.
    const pool = new Pool({
        connectionString: dbUrl,
        max: 1,
        // Supabase requires SSL.
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


