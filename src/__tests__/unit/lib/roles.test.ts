import { describe, it, expect } from "vitest";
import {
    isDirectionRole,
    isSuperAdmin,
    hasAdminAccess,
    isTresorier,
    canManageUsers,
    isBenevole,
    isPartenaire,
    isPortalRole,
    isValidRole,
    DIRECTION_ROLES,
    PORTAL_ROLES,
} from "@/lib/roles";

describe("roles — isDirectionRole", () => {
    it.each(["DIRECTRICE", "DIRECTEUR", "DIRECTION", "DIRECTEUR ADJOINT", "DIRECTRICE ADJOINTE", "TRESORIERE", "TRESORIER"])(
        "returns true for %s",
        (role) => expect(isDirectionRole(role)).toBe(true)
    );

    it.each(["SUPER_ADMIN", "BENEVOLE", "PARTENAIRE", "UNKNOWN"])(
        "returns false for %s",
        (role) => expect(isDirectionRole(role)).toBe(false)
    );

    it("returns false for null/undefined/empty", () => {
        expect(isDirectionRole(null)).toBe(false);
        expect(isDirectionRole(undefined)).toBe(false);
        expect(isDirectionRole("")).toBe(false);
    });

    it("is case-insensitive", () => {
        expect(isDirectionRole("directrice")).toBe(true);
        expect(isDirectionRole("Tresoriere")).toBe(true);
    });
});

describe("roles — isSuperAdmin", () => {
    it("returns true for SUPER_ADMIN", () => {
        expect(isSuperAdmin("SUPER_ADMIN")).toBe(true);
    });

    it("is case-insensitive", () => {
        expect(isSuperAdmin("super_admin")).toBe(true);
    });

    it.each(["DIRECTRICE", "BENEVOLE", "PARTENAIRE", null, undefined, ""])(
        "returns false for %s",
        (role) => expect(isSuperAdmin(role as string)).toBe(false)
    );
});

describe("roles — hasAdminAccess", () => {
    it("returns true for SUPER_ADMIN and all direction roles", () => {
        expect(hasAdminAccess("SUPER_ADMIN")).toBe(true);
        expect(hasAdminAccess("DIRECTRICE")).toBe(true);
        expect(hasAdminAccess("TRESORIERE")).toBe(true);
    });

    it.each(["BENEVOLE", "PARTENAIRE", null, undefined])(
        "returns false for %s",
        (role) => expect(hasAdminAccess(role as string)).toBe(false)
    );
});

describe("roles — isTresorier", () => {
    it("returns true for TRESORIERE and TRESORIER", () => {
        expect(isTresorier("TRESORIERE")).toBe(true);
        expect(isTresorier("TRESORIER")).toBe(true);
        expect(isTresorier("tresoriere")).toBe(true);
    });

    it("returns false for other roles", () => {
        expect(isTresorier("DIRECTRICE")).toBe(false);
        expect(isTresorier("SUPER_ADMIN")).toBe(false);
    });
});

describe("roles — canManageUsers", () => {
    it("allows SUPER_ADMIN and DIRECTRICE to manage users", () => {
        expect(canManageUsers("SUPER_ADMIN")).toBe(true);
        expect(canManageUsers("DIRECTRICE")).toBe(true);
        expect(canManageUsers("DIRECTEUR ADJOINT")).toBe(true);
    });

    it("excludes TRESORIERE from user management", () => {
        expect(canManageUsers("TRESORIERE")).toBe(false);
        expect(canManageUsers("TRESORIER")).toBe(false);
    });

    it("excludes non-admin roles", () => {
        expect(canManageUsers("BENEVOLE")).toBe(false);
        expect(canManageUsers("PARTENAIRE")).toBe(false);
    });
});

describe("roles — isBenevole", () => {
    it("returns true for BENEVOLE", () => {
        expect(isBenevole("BENEVOLE")).toBe(true);
        expect(isBenevole("benevole")).toBe(true);
    });

    it("returns false for others", () => {
        expect(isBenevole("PARTENAIRE")).toBe(false);
        expect(isBenevole(null)).toBe(false);
    });
});

describe("roles — isPartenaire", () => {
    it("returns true for PARTENAIRE", () => {
        expect(isPartenaire("PARTENAIRE")).toBe(true);
        expect(isPartenaire("partenaire")).toBe(true);
    });

    it("returns false for others", () => {
        expect(isPartenaire("BENEVOLE")).toBe(false);
    });
});

describe("roles — isPortalRole", () => {
    it("returns true for all portal-enabled roles", () => {
        for (const role of PORTAL_ROLES) {
            expect(isPortalRole(role)).toBe(true);
        }
    });

    it("returns false for unknown roles", () => {
        expect(isPortalRole("UNKNOWN")).toBe(false);
        expect(isPortalRole(null)).toBe(false);
    });
});

describe("roles — isValidRole", () => {
    it("returns true for all valid roles", () => {
        for (const role of PORTAL_ROLES) {
            expect(isValidRole(role)).toBe(true);
        }
    });

    it("returns false for invalid roles", () => {
        expect(isValidRole("HACKER")).toBe(false);
        expect(isValidRole("")).toBe(false);
    });
});

describe("roles — constants", () => {
    it("DIRECTION_ROLES includes expected roles", () => {
        expect(DIRECTION_ROLES).toContain("TRESORIERE");
        expect(DIRECTION_ROLES).toContain("DIRECTRICE");
    });

    it("PORTAL_ROLES includes BENEVOLE and PARTENAIRE", () => {
        expect(PORTAL_ROLES).toContain("BENEVOLE");
        expect(PORTAL_ROLES).toContain("PARTENAIRE");
        expect(PORTAL_ROLES).toContain("SUPER_ADMIN");
    });
});
