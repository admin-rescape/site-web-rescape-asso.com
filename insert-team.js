const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const members = await prisma.teamMember.findMany();
    if (members.length === 0) {
        console.log("Team is empty, inserting initial fallback members...");

        await prisma.teamMember.createMany({
            data: [
                { name: "Vanessa Delarue", role: "Présidente", order: 1 },
                { name: "Nicolas Delarue", role: "Vice-Président", order: 2 },
                { name: "Nadia Bennaceur", role: "Trésorière", order: 3 },
                { name: "Sandrine Laruelle", role: "Secrétaire", order: 4 },
            ]
        });
        console.log("Initial team members inserted successfully!");
    } else {
        console.log("Team members already exist. Skipping insertion.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
