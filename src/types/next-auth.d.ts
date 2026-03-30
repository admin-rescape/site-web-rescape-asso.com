import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string;
            organizationName?: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        organizationName?: string | null;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        role: string;
        organizationName?: string | null;
    }
}
