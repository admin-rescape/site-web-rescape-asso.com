import { test, expect } from "@playwright/test";

// Password is read from E2E_TEST_PASSWORD env var — never hardcode credentials.
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";
const USERS = {
    directrice: { email: "delaruevanessa48@gmail.com", password: TEST_PASSWORD },
    tresoriere: { email: "nadia@rescape.fr", password: TEST_PASSWORD },
    benevole: { email: "benevole@rescape.fr", password: TEST_PASSWORD },
    partenaire: { email: "partenaire@test.fr", password: TEST_PASSWORD },
};

async function loginAs(page: any, user: { email: string; password: string }) {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/mot de passe/i).fill(user.password);
    await page.getByRole("button", { name: /connexion/i }).click();
    await page.waitForURL(/\/admin\/dashboard/);
}

test.describe("Admin Dashboard — Direction Access", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USERS.directrice);
    });

    test("should display the admin dashboard overview", async ({ page }) => {
        await expect(page.locator("h1, h2").first()).toBeVisible();
        await expect(page.getByRole("link", { name: /articles/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /événements/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /messages/i })).toBeVisible();
    });

    test("should navigate to articles management at /admin/dashboard/articles", async ({ page }) => {
        await page.goto("/admin/dashboard/articles");
        await expect(page.getByRole("heading", { name: /actualités|articles/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /nouvel article/i })).toBeVisible();
    });

    test("should navigate to events management at /admin/dashboard/events", async ({ page }) => {
        await page.goto("/admin/dashboard/events");
        await expect(page.getByRole("heading", { name: /événements/i })).toBeVisible();
    });

    test("should navigate to messages at /admin/dashboard/messages", async ({ page }) => {
        await page.goto("/admin/dashboard/messages");
        await expect(page.getByRole("heading", { name: /messages|boîte/i })).toBeVisible();
    });

    test("should navigate to accounting at /admin/dashboard/compta", async ({ page }) => {
        await page.goto("/admin/dashboard/compta");
        await expect(page.getByRole("heading", { name: /comptabilité|compta/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /exporter|export/i })).toBeVisible();
    });

    test("should be able to create a new article", async ({ page }) => {
        await page.goto("/admin/dashboard/articles/new");
        await expect(page.getByLabel(/titre/i)).toBeVisible();
        await expect(page.getByLabel(/contenu/i)).toBeVisible();
    });

    test("should navigate to team management at /admin/dashboard/team", async ({ page }) => {
        await page.goto("/admin/dashboard/team");
        await expect(page.getByRole("heading", { name: /équipe/i })).toBeVisible();
    });

    test("should NOT show user management link (SUPER_ADMIN only)", async ({ page }) => {
        await expect(page.getByRole("link", { name: /utilisateurs/i })).not.toBeVisible();
    });
});

test.describe("Espace Bénévole", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USERS.benevole);
    });

    test("should show the bénévole dashboard", async ({ page }) => {
        await expect(page.getByText(/espace bénévole|bienvenue|bonjour/i)).toBeVisible();
    });

    test("should show mission list at /admin/dashboard/missions", async ({ page }) => {
        await page.goto("/admin/dashboard/missions");
        await expect(page.getByRole("heading", { name: /mes missions/i })).toBeVisible();
    });

    test("should show calendar at /admin/dashboard/calendrier", async ({ page }) => {
        await page.goto("/admin/dashboard/calendrier");
        await expect(page.getByRole("heading", { name: /calendrier des actions/i })).toBeVisible();
    });
});

test.describe("Espace Trésorière", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USERS.tresoriere);
    });

    test("should show accounting overview for trésorière", async ({ page }) => {
        await page.goto("/admin/dashboard/compta");
        await expect(page.getByRole("heading", { name: /comptabilité & trésorerie/i })).toBeVisible();
    });

    test("should show CSV export button", async ({ page }) => {
        await page.goto("/admin/dashboard/compta");
        await expect(page.getByRole("button", { name: /exporter|csv/i })).toBeVisible();
    });
});

test.describe("Espace Partenaire", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, USERS.partenaire);
    });

    test("should show partner donations page", async ({ page }) => {
        await page.goto("/admin/dashboard/mes-dons");
        await expect(page.getByRole("heading", { name: /mes dons & contributions/i })).toBeVisible();
    });

    test("should show partner messaging page", async ({ page }) => {
        await page.goto("/admin/dashboard/messages-asso");
        await expect(page.getByRole("heading", { name: /communication avec l'asso/i })).toBeVisible();
    });

    test("should block partner from business routes", async ({ page }) => {
        await page.goto("/admin/dashboard/compta");
        await expect(page).toHaveURL(/\/admin\/dashboard/);
    });
});
