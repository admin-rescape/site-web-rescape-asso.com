/**
 * Swap the datasource provider in prisma/schema.prisma.
 * Usage:  node scripts/set-provider.js postgresql
 *         node scripts/set-provider.js sqlite
 *
 * Called automatically by the Vercel build command to switch to PostgreSQL.
 */
const fs = require('fs');
const path = require('path');

const provider = process.argv[2];
if (!['sqlite', 'postgresql'].includes(provider)) {
    console.error('Usage: node scripts/set-provider.js <sqlite|postgresql>');
    process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

schema = schema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${provider}"`
);

fs.writeFileSync(schemaPath, schema, 'utf-8');
console.log(`✅ Schema provider set to "${provider}"`);
