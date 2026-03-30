// Usage: node scripts/mark-adherents.js
// This script finds users with at least one membership and sets their role to 'ADHERENT'.
// Ensure DATABASE_URL is set in the environment before running.

const { PrismaClient } = require('@prisma/client');

async function main() {
  // Require DATABASE_URL for safety in this script (avoid sqlite native deps mismatch).
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: Please set DATABASE_URL environment variable before running this script.');
    process.exit(1);
  }

  // Mirror the application's prisma initialization so adapters are provided
  const dbUrl = process.env.DATABASE_URL;
  const isSqlite = dbUrl.startsWith('file:');

  let prisma;
  if (isSqlite) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Database = require('better-sqlite3');
    const dbPath = dbUrl.replace('file:', '');
    const db = new Database(dbPath);
    const adapter = new PrismaBetterSqlite3(db);
    prisma = new PrismaClient({ adapter });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: {},
        },
      },
      select: { id: true, email: true, role: true },
    });

    console.log(`Found ${users.length} users with memberships.`);

    let updated = 0;
    for (const u of users) {
      if (u.role !== 'ADHERENT') {
        await prisma.user.update({ where: { id: u.id }, data: { role: 'ADHERENT' } });
        updated++;
        console.log(`Updated ${u.email} -> ADHERENT`);
      }
    }

    console.log(`Done. Updated ${updated} users.`);
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
