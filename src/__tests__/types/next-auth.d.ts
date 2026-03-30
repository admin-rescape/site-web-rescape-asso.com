// Extend next-auth types for tests — the full extension will be done in Phase 2
// This type augmentation ensures test files compile correctly before the schema change
import "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
    }
    interface Session {
        user?: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
        };
    }
}
