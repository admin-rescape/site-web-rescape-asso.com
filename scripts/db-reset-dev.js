/**
 * Remet à zéro la base SQLite de développement.
 * Supprime dev.db, relance prisma db push + seed.
 *
 * Usage: node scripts/db-reset-dev.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

// 1. Supprimer le fichier SQLite existant
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️  Ancienne base dev.db supprimée');
} else {
    console.log('ℹ️  Aucune base dev.db existante');
}

// Supprimer aussi le journal WAL s'il existe
for (const suffix of ['-journal', '-wal', '-shm']) {
    const f = dbPath + suffix;
    if (fs.existsSync(f)) fs.unlinkSync(f);
}

// 2. Recréer le schéma
console.log('\n📐 Création du schéma (prisma db push)...');
execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

// 3. Seed
console.log('\n🌱 Seed de la base...');
execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

console.log('\n✅ Base de développement réinitialisée avec succès !');
