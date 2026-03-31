import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'direction@rescape-asso.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
            data: {
                name: 'Directeur Test',
                email,
                password: hashedPassword,
                role: 'DIRECTION',
            },
        });
        console.log('Created user:', user.email);
    } else {
        console.log('User already exists:', user.email);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
