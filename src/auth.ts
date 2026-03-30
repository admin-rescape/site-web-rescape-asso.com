import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { isPortalRole } from "@/lib/roles";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { email, password } = await loginSchema.parseAsync(credentials);
                const normalizedEmail = email.toLowerCase().trim();

                const user = await prisma.user.findUnique({
                    where: { email: normalizedEmail },
                });

                // Only portal-enabled roles can sign in.
                if (!user) return null;
                if (!isPortalRole(user.role)) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        organizationName: user.organizationName
                    };
                }

                return null;
            },
        }),
    ],
});
