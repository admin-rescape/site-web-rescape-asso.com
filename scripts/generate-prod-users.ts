/**
 * generate-prod-users.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Crée (ou met à jour) les utilisateurs de production dans la base Supabase
 * avec des mots de passe forts et DIFFÉRENTS pour chaque compte.
 *
 * Après exécution, les credentials sont enregistrés dans `creds-prod.txt`
 * (à la racine du projet) — NE PAS committer ce fichier.
 *
 * Usage :
 *   node scripts/set-provider.js postgresql
 *   dotenv -e .env.production.local -- npx tsx scripts/generate-prod-users.ts
 *   node scripts/set-provider.js sqlite
 *
 * Ou via le script npm (à ajouter dans package.json) :
 *   "db:prod:users": "node scripts/set-provider.js postgresql && dotenv -e .env.production.local -- npx tsx scripts/generate-prod-users.ts && node scripts/set-provider.js sqlite"
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

// ─── Génération de mot de passe fort ────────────────────────────────────────
/**
 * Génère un mot de passe aléatoire de `length` caractères contenant :
 * au moins 1 majuscule, 1 chiffre, 1 caractère spécial.
 */
function generateStrongPassword(length = 20): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '@#$%!&*+-=?';
    const all = upper + lower + digits + special;

    // Garantit au moins un caractère de chaque catégorie
    const mandatory = [
        upper[randomBytes(1)[0] % upper.length],
        upper[randomBytes(1)[0] % upper.length],
        lower[randomBytes(1)[0] % lower.length],
        lower[randomBytes(1)[0] % lower.length],
        digits[randomBytes(1)[0] % digits.length],
        digits[randomBytes(1)[0] % digits.length],
        special[randomBytes(1)[0] % special.length],
    ];

    const remaining = Array.from({ length: length - mandatory.length }, () =>
        all[randomBytes(1)[0] % all.length]
    );

    // Mélange Fisher-Yates
    const chars = [...mandatory, ...remaining];
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomBytes(1)[0] % (i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

// ─── Définition des utilisateurs de prod ────────────────────────────────────
interface UserDef {
    email: string;
    name: string;
    role: string;
    label: string; // Description lisible pour creds-prod.txt
}

const PROD_USERS: UserDef[] = [
    {
        email: 'contact-technique@rescape-asso.com',
        name: 'Dev Technique',
        role: 'SUPER_ADMIN',
        label: 'Super Admin / Dev Technique',
    },
    {
        email: 'direction@rescape-asso.com',
        name: 'Vanessa Delarue',
        role: 'DIRECTRICE',
        label: 'Directrice (Vanessa Delarue)',
    },
    {
        email: 'tresorier@rescape-asso.com',
        name: 'Nadia Bennaceur',
        role: 'TRESORIERE',
        label: 'Trésorière (Nadia Bennaceur)',
    },
];

// ─── Connexion Prisma → Supabase (PostgreSQL) ────────────────────────────────
async function createPrismaClient(): Promise<PrismaClient> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL non définie dans les variables d\'environnement.');

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as never);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🔐 Génération des utilisateurs de production Supabase...\n');

    const prisma = await createPrismaClient();

    const lines: string[] = [
        '╔══════════════════════════════════════════════════════════════╗',
        '║          CREDENTIALS PRODUCTION — RESCAPE-ASSO.COM          ║',
        '║  ⚠️  FICHIER CONFIDENTIEL — NE PAS COMMITTER, NE PAS PARTAGER ║',
        `║  Généré le : ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}                        ║`,
        '╚══════════════════════════════════════════════════════════════╝',
        '',
        `URL de connexion : https://www.rescape-asso.com/login`,
        '',
        '─────────────────────────────────────────────────────────────',
    ];

    for (const user of PROD_USERS) {
        const password = generateStrongPassword(22);
        const hash = await bcrypt.hash(password, 12); // bcrypt cost 12 en prod

        await (prisma as PrismaClient).user.upsert({
            where: { email: user.email },
            update: {
                password: hash,
                role: user.role as never,
                name: user.name,
            },
            create: {
                email: user.email,
                name: user.name,
                password: hash,
                role: user.role as never,
            },
        });

        console.log(`✅ ${user.label} → ${user.email}`);

        lines.push('');
        lines.push(`Compte       : ${user.label}`);
        lines.push(`Email        : ${user.email}`);
        lines.push(`Mot de passe : ${password}`);
        lines.push(`Rôle         : ${user.role}`);
        lines.push('─────────────────────────────────────────────────────────────');
    }

    lines.push('');
    lines.push('NOTES DE SÉCURITÉ :');
    lines.push('  • Chaque mot de passe est unique et généré aléatoirement (22 chars).');
    lines.push('  • Hachage bcrypt cost=12 — les mots de passe ne sont PAS récupérables depuis la BDD.');
    lines.push('  • Transmettez chaque mot de passe par canal sécurisé (Signal, remise en main propre).');
    lines.push('  • Supprimez ce fichier après distribution des accès.');
    lines.push('  • Ajoutez `creds-prod.txt` dans votre .gitignore.');
    lines.push('');

    const outputPath = join(process.cwd(), 'creds-prod.txt');
    writeFileSync(outputPath, lines.join('\n'), { encoding: 'utf-8' });

    console.log(`\n📄 Credentials sauvegardés dans : ${outputPath}`);
    console.log('⚠️  NE COMMITEZ PAS ce fichier — vérifiez votre .gitignore\n');

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error('❌ Erreur :', e.message);
    process.exit(1);
});
