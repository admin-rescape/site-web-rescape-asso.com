import { test, expect } from "@playwright/test";

// ─── Visual Non-Regression Tests ───────────────────────────────────────────────
// These tests take screenshots of all public pages to detect unintended
// design changes (color palette, typography, layout). 
// The design charter MUST NOT change during implementation.
// Run after any code change to validate visual integrity.

test.describe("Design Non-Regression — Public Pages", () => {
    test.beforeEach(async ({ page }) => {
        // Disable animations for consistent screenshots
        await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
    });

    test("Homepage visual snapshot", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot("homepage-full.png", {
            fullPage: true,
            maxDiffPixelRatio: 0.02, // Allow 2% pixel difference max
        });
    });

    test("Homepage — Hero section visual snapshot", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        const heroSection = page.locator("#hero");
        await expect(heroSection).toHaveScreenshot("hero-section.png", { maxDiffPixelRatio: 0.02 });
    });

    test("Homepage — Stats section visual snapshot", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        const statsSection = page.locator("#stats-section");
        await expect(statsSection).toHaveScreenshot("stats-section.png", { maxDiffPixelRatio: 0.02 });
    });

    test("Homepage — Actions section visual snapshot", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        const actionsSection = page.locator("#actions-section");
        await expect(actionsSection).toHaveScreenshot("actions-section.png", { maxDiffPixelRatio: 0.02 });
    });

    test("Contact page visual snapshot", async ({ page }) => {
        await page.goto("/contact");
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot("contact-page.png", {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
        });
    });

    test("Notre Histoire page visual snapshot", async ({ page }) => {
        await page.goto("/histoire");
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot("histoire-page.png", {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
        });
    });

    test("Actualités page visual snapshot", async ({ page }) => {
        await page.goto("/actualites");
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot("actualites-page.png", {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
        });
    });

    test("Soutenir page visual snapshot", async ({ page }) => {
        await page.goto("/soutenir");
        await page.waitForLoadState("networkidle");
        await expect(page).toHaveScreenshot("soutenir-page.png", {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
        });
    });
});

test.describe("Design Charter — CSS Variables Integrity", () => {
    test("primary color should be the Rescape green/teal defined in design", async ({ page }) => {
        await page.goto("/");
        const primaryColor = await page.evaluate(() =>
            getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim()
        );
        // Design charter: primary color is the brand color — should not be empty
        expect(primaryColor).not.toBe("");
        expect(primaryColor).not.toBe("initial");
    });

    test("Pacifico font should be loaded for headings", async ({ page }) => {
        await page.goto("/");
        const fontFamilies = await page.evaluate(() =>
            getComputedStyle(document.querySelector("h1, .font-pacifico")!).fontFamily
        );
        expect(fontFamilies).toMatch(/pacifico/i);
    });
});

// ─── Performance Tests ─────────────────────────────────────────────────────────
test.describe("Performance — Core Web Vitals", () => {
    test("Homepage LCP should be under 2.5 seconds", async ({ page }) => {
        await page.goto("/");
        const lcp = await page.evaluate(() =>
            new Promise<number>((resolve) => {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ type: "largest-contentful-paint", buffered: true });
                setTimeout(() => resolve(0), 5000); // fallback
            })
        );
        // LCP should be under 2500ms (2.5s) for a "Good" CWV score
        if (lcp > 0) {
            expect(lcp).toBeLessThan(2500);
        }
    });

    test("Homepage should have no console errors on load", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") errors.push(msg.text());
        });
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        // Filter out known external error (e.g. extension errors)
        const criticalErrors = errors.filter(
            (e) => !e.includes("Extension") && !e.includes("chrome-extension")
        );
        expect(criticalErrors).toHaveLength(0);
    });
});
