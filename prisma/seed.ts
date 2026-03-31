import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isSqlite = dbUrl.startsWith('file:');

async function createPrismaClient(): Promise<PrismaClient> {
    if (isSqlite) {
        const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
        return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
    } else {
        const { Pool } = await import('pg');
        const { PrismaPg } = await import('@prisma/adapter-pg');
        const pool = new Pool({ connectionString: dbUrl });
        return new PrismaClient({ adapter: new PrismaPg(pool) });
    }
}

async function main() {
    const prisma = await createPrismaClient();
    console.log(`🌱 Starting seed... (${isSqlite ? 'SQLite' : 'PostgreSQL'})`);

    // 1. Create Users (Roles: SUPER_ADMIN, DIRECTRICE, TRESORIERE, BENEVOLE, PARTENAIRE)
    const passwordHash = await bcrypt.hash('Rescape2026!', 10);

    const usersToSeed = [
        { email: 'contact-technique@rescape-asso.com', name: 'Dev', role: 'SUPER_ADMIN', organizationName: 'Rescape' },
        { email: 'direction@rescape-asso.com', name: 'Vanessa Delarue', role: 'DIRECTRICE', organizationName: 'Rescape' },
        { email: 'tresorier@rescape-asso.com', name: 'Nadia Bennaceur', role: 'TRESORIERE', organizationName: 'Rescape' },
    ];

    for (const u of usersToSeed) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role, organizationName: u.organizationName || null },
            create: {
                email: u.email,
                name: u.name,
                password: passwordHash,
                role: u.role,
                organizationName: u.organizationName || null,
            },
        });
    }
    console.log('✅ Users created');

    // 2. Create Default Stats
    const statsData = [
        { label: "Années d'existence", value: 5, suffix: "+" },
        { label: "Personnes aidées", value: 1200, suffix: "" },
        { label: "Kg anti-gaspi", value: 5000, suffix: "+" },
        { label: "Partenaires", value: 15, suffix: "" },
    ];

    for (const stat of statsData) {
        const existing = await prisma.stat.findFirst({ where: { label: stat.label } });
        if (!existing) {
            await prisma.stat.create({ data: stat });
        }
    }
    console.log('✅ Stats seeded');

    // 3. Create Default Actions
    const actionsData = [
        { title: "Armoire solidaire", description: "Une armoire en libre-service devant le local...", icon: "warehouse", status: "En cours" },
        { title: "Sacs alimentaires d'urgence", description: "Pour les familles en difficulté...", icon: "utensils", status: "En cours" },
        { title: "Potager jardin du partage", description: "Un espace vert collectif...", icon: "sprout", status: "Saisonnier" },
        { title: "Événements scolaires", description: "Interventions dans les écoles...", icon: "handheart", status: "Ponctuel" },
        { title: "Noël solidaire", description: "Collecte de jouets et distribution...", icon: "handheart", status: "Saisonnier" },
        { title: "Ateliers et animations", description: "Cuisine zéro déchet, couture...", icon: "handheart", status: "En cours" },
    ];

    for (const action of actionsData) {
        const existing = await prisma.action.findFirst({ where: { title: action.title } });
        if (!existing) {
            await prisma.action.create({ data: action });
        }
    }
    console.log('✅ Actions seeded');

    // 4. Create Timeline Entries
    const timelineData = [
        {
            order: 1,
            title: "Phase 1 - \"Du Cœur à la Couture\"",
            icon: "😷",
            content: "Un masque cousu par amour devient le point de départ. La chaîne de masques commence simplement, motivée par la peur de perdre à nouveau. Du tissu élastique arrive sur une palette, le premier pas vers l'aide collective.",
        },
        {
            order: 2,
            title: "Phase 2 - \"Quand l'Aide Frappe à la Porte\"",
            icon: "🍱",
            content: "Un monsieur en difficulté apporte ses soucis de nourriture. L'association s'élargit naturellement au-delà des masques. Un sac de nourriture rejoint la palette : ReScape devient multifonctionnel.",
        },
        {
            order: 3,
            title: "Phase 3 - \"De la Rue à la Légalité\"",
            icon: "⚖️",
            content: "Les armoires débordent du trottoir. Pour continuer sans déranger, ils doivent se structurer. Nait alors la nécessité de transformer une belle action citoyenne en association officielle, inscrite dans les règles.",
        },
        {
            order: 4,
            title: "Phase 4 - \"L'Armoire Grandit, Les Rêves S'Envolent\"",
            icon: "🧺",
            content: "L'association se crée avec une armoire encore plus grande. Les actions se multiplient : événements scolaires, noël, potager partagé. ReScape devient un véritable hub communautaire au cœur d'Aniche.",
        },
        {
            order: 5,
            title: "Phase 5 - \"Trouver Sa Maison\"",
            icon: "🏠",
            content: "Après l'ampleur, vient la responsabilité. L'association se stabilise au local, s'organise contre le gaspillage et cherche des partenaires. ReScape grandit, mais reste accessible et à l'écoute.",
        }
    ];

    for (const phase of timelineData) {
        const existing = await prisma.timelineEntry.findFirst({ where: { title: phase.title } });
        if (!existing) {
            await prisma.timelineEntry.create({ data: phase });
        }
    }
    console.log('✅ Timeline seeded');

    // 5. Create Team Members
    const teamData = [
        { name: "Vanessa Delarue", role: "Présidente & Fondatrice", order: 1 },
        { name: "Nicolas Delarue", role: "Vice-Président", order: 2 },
        { name: "Nadia Bennaceur", role: "Trésorière", order: 3 },
    ];

    for (const member of teamData) {
        const existing = await prisma.teamMember.findFirst({ where: { name: member.name } });
        if (!existing) {
            await prisma.teamMember.create({ data: member });
        }
    }
    console.log('✅ Team seeded');

    // 6. Create Social Links
    const socialData = [
        { platform: "facebook", url: "https://facebook.com/rescape" },
        { platform: "instagram", url: "https://instagram.com/rescape" },
    ];

    for (const link of socialData) {
        const existing = await prisma.socialLink.findFirst({ where: { platform: link.platform } });
        if (!existing) {
            await prisma.socialLink.create({ data: link });
        }
    }
    console.log('✅ Social links seeded');

    await prisma.$disconnect();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
