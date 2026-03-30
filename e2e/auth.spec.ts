import { test, expect } from "@playwright/test";

// ─── Fixtures: Test credentials per role ──────────────────────────────────────
const USERS = {
    superAdmin: { email: "admin@rescape.fr", password: "Rescape2026!", role: "SUPER_ADMIN" },
    directrice: { email: "delaruevanessa48@gmail.com", password: "Rescape2026!", role: "DIRECTRICE" },
    nicolas: { email: "nicolas@rescape.fr", password: "Rescape2026!", role: "DIRECTRICE" },
    nadia: { email: "nadia@rescape.fr", password: "Rescape2026!", role: "TRESORIERE" },
    benevole: { email: "benevole@rescape.fr", password: "Rescape2026!", role: "BENEVOLE" },
    partenaire: { email: "partenaire@test.fr", password: "Rescape2026!", role: "PARTENAIRE" },
};

async function loginAs(page: any, user: typeof USERS.directrice) {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/mot de passe/i).fill(user.password);
    await page.getByRole("button", { name: /connexion/i }).click();
    await page.waitForLoadState("networkidle");
}

// ─── Auth Tests ────────────────────────────────────────────────────────────────
test.describe("Authentication Flow", () => {
    test("should display the login page at /admin/login", async ({ page }) => {
        await page.goto("/admin/login");
        await expect(page).toHaveTitle(/connexion|login|rescape/i);
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
        await expect(page.getByRole("button", { name: /connexion/i })).toBeVisible();
    });

    test("should show an error on invalid credentials", async ({ page }) => {
        await page.goto("/admin/login");
        await page.getByLabel(/email/i).fill("wrong@email.com");
        await page.getByLabel(/mot de passe/i).fill("WrongPassword!");
        await page.getByRole("button", { name: /connexion/i }).click();
        await expect(page.getByRole("alert")).toBeVisible();
    });

    test("should redirect to /admin/dashboard after DIRECTRICE login", async ({ page }) => {
        await loginAs(page, USERS.directrice);
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should redirect to /admin/dashboard after BENEVOLE login", async ({ page }) => {
        await loginAs(page, USERS.benevole);
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should redirect to /admin/dashboard after TRESORIERE login", async ({ page }) => {
        await loginAs(page, USERS.nadia);
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should redirect to /admin/dashboard after PARTENAIRE login", async ({ page }) => {
        await loginAs(page, USERS.partenaire);
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should logout and return to homepage", async ({ page }) => {
        await loginAs(page, USERS.directrice);
        await page.getByRole("button", { name: /déconnexion/i }).click();
        await expect(page).toHaveURL("/");
    });
});

// ─── Authorization / Route Protection ─────────────────────────────────────────
test.describe("Route Protection", () => {
    test("should redirect unauthenticated user to /admin/login when accessing /admin/dashboard", async ({ page }) => {
        await page.goto("/admin/dashboard");
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test("should redirect unauthenticated user when accessing /admin/dashboard/missions", async ({ page }) => {
        await page.goto("/admin/dashboard/missions");
        await expect(page).toHaveURL(/\/admin\/login/);
    });

    test("should prevent BENEVOLE from accessing /admin/dashboard/compta", async ({ page }) => {
        await loginAs(page, USERS.benevole);
        await page.goto("/admin/dashboard/compta");
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should prevent PARTENAIRE from accessing /admin/dashboard/compta", async ({ page }) => {
        await loginAs(page, USERS.partenaire);
        await page.goto("/admin/dashboard/compta");
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should prevent TRESORIERE from accessing /admin/dashboard/settings", async ({ page }) => {
        await loginAs(page, USERS.nadia);
        await page.goto("/admin/dashboard/settings");
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });

    test("should prevent BENEVOLE from accessing /admin/dashboard/compta", async ({ page }) => {
        await loginAs(page, USERS.benevole);
        await page.goto("/admin/dashboard/compta");
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });
});
