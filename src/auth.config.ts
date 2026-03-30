import type { NextAuthConfig } from "next-auth";
import { isPortalRole } from "@/lib/roles";

export const authConfig = {
    // trustHost lets NextAuth derive the base URL from the X-Forwarded-Host header
    // sent by Vercel's proxy instead of falling back to NEXTAUTH_URL=localhost:3000.
    trustHost: true,
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.organizationName = user.organizationName;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                if (token.organizationName) {
                    session.user.organizationName = token.organizationName as string;
                }
            }
            return session;
        },
        async signIn({ user }) {
            // Block accounts that are not meant to access the portal.
            if (user && !isPortalRole((user as any).role)) {
                return false;
            }
            return true;
        },
        authorized() {
            // By default, let the middleware completely handle routing and redirection
            // We return true so NextAuth wrapper doesn't inject automatic redirect loops
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
