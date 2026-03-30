import { test, expect } from "@playwright/test";

// ─── Public Site E2E Tests ─────────────────────────────────────────────────────
// These tests ensure that public pages remain accessible without authentication
// and that the design charter is NOT broken by future changes.

test.describe("Public Pages — Accessibility & Navigation", () => {
    test("Homepage loads correctly at /", async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveTitle(/rescape/i);
        await expect(page.locator("#homepage")).toBeVisible();
    });

    test("Stats section is visible on homepage", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#stats-section")).toBeVisible();
    });

    test("Actions section is visible on homepage", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#actions-section")).toBeVisible();
    });

    test("Contact page loads at /contact", async ({ page }) => {
        await page.goto("/contact");
        await expect(page.locator("#contact-page")).toBeVisible();
    });

    test("Notre Histoire page loads at /histoire", async ({ page }) => {
        await page.goto("/histoire");
        await expect(page.locator("#histoire-page")).toBeVisible();
        await expect(page.locator("#histoire-timeline")).toBeVisible();
    });

    test("Actualités page loads at /actualites", async ({ page }) => {
        await page.goto("/actualites");
        await expect(page.locator("#actualites-page")).toBeVisible();
    });

    test("Soutenir page loads at /soutenir", async ({ page }) => {
        await page.goto("/soutenir");
        await expect(page.locator("#soutenir-page")).toBeVisible();
    });

    test("Footer is visible on all public pages", async ({ page }) => {
        for (const path of ["/", "/contact", "/histoire", "/actualites", "/soutenir"]) {
            await page.goto(path);
            await expect(page.locator("footer")).toBeVisible();
        }
    });

    test("Navbar contains public navigation links on homepage", async ({ page }) => {
        await page.goto("/");
        await expect(page.getByRole("link", { name: /notre histoire/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /soutenir/i })).toBeVisible();
    });
});

test.describe("Contact Form — E2E Submission", () => {
    test("should submit contact form successfully", async ({ page }) => {
        await page.goto("/contact");
        await page.getByLabel(/prénom/i).fill("Testeur");
        await page.getByLabel(/email/i).fill("testeur@example.com");
        await page.getByRole("textbox", { name: /message/i }).fill(
            "Bonjour, je souhaite en savoir plus sur vos actions solidaires. Merci de votre réponse."
        );
        await page.getByRole("button", { name: /envoyer/i }).click();
        await expect(page.getByText(/c'est envoyé|message envoyé|merci/i)).toBeVisible({ timeout: 10000 });
    });

    test("should show error when submitting an empty form", async ({ page }) => {
        await page.goto("/contact");
        await page.getByRole("button", { name: /envoyer/i }).click();
        // At least one required field error should appear
        await expect(page.getByRole("alert").first()).toBeVisible();
    });
});
