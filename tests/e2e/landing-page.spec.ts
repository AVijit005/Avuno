import { test, expect } from "@playwright/test";

test.describe("Phase 23 - World-Class Landing Experience", () => {
  test("landing page loads and displays core elements", async ({ page }) => {
    await page.goto("/");

    // Wait for hero to load
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Check hero headline
    await expect(page.locator("h1")).toContainText("personal media archive");
    await expect(page.locator("h1")).toContainText("connected");

    // Check main CTA exists
    const startButton = page.getByRole("link", { name: /start with avuno/i }).first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveAttribute("href", "/auth");

    // Check navigation
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByText("Avuno", { exact: true }).first()).toBeVisible();

    // Check Product link in nav
    const productLink = page.getByRole("link", { name: "Product" }).first();
    await expect(productLink).toBeVisible();

    // Check section IDs exist for anchor links
    await expect(page.locator("#connected-system")).toBeAttached({ timeout: 15000 });

    // Verify no horizontal scroll
    const body = await page.locator("body");
    const bodyBox = await body.boundingBox();
    const viewportSize = page.viewportSize();
    if (bodyBox && viewportSize) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewportSize.width + 1);
    }
  });

  test("mobile menu works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu button should be visible
    const menuButton = page.getByRole("button", { name: /menu|navigation/i });
    await expect(menuButton).toBeVisible();

    // Click to open
    await menuButton.click();

    // Check mobile nav is visible
    const mobileNav = page.getByRole("navigation", { name: /mobile/i });
    await expect(mobileNav).toBeVisible();

    // Check links
    await expect(mobileNav.getByRole("link", { name: "Product" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Journal" })).toBeVisible();
  });

  test("interactive product demo works", async ({ page }) => {
    await page.goto("/");

    // Scroll to find the media type buttons
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll("h2")).find((h) =>
        h.textContent?.includes("Eight media types"),
      );
      if (heading) {
        heading.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    await page.waitForTimeout(500);

    // Find and click a media type button (Books)
    const booksButton = page.getByRole("button", { name: /books/i }).first();
    if (await booksButton.isVisible()) {
      await booksButton.click();
      await page.waitForTimeout(300);

      // Verify content changed
      await expect(page.locator("text=1984")).toBeVisible({ timeout: 5000 });
    }
  });

  test("connected system visual is present", async ({ page }) => {
    await page.goto("/");

    // Scroll to connected system section
    await page.evaluate(() => {
      const section = document.getElementById("connected-system");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    await page.waitForTimeout(500);

    // Check for the section
    await expect(page.locator("#connected-system")).toBeVisible();

    await expect(page.getByText("Library").first()).toBeVisible();
    await expect(page.getByText("Journal").first()).toBeVisible();
    await expect(page.getByText("Memory").first()).toBeVisible();
    await expect(page.getByText("Timeline").first()).toBeVisible();
    await expect(page.getByText("Analytics").first()).toBeVisible();
  });

  test("conversion path works", async ({ page }) => {
    await page.goto("/");

    // Click primary CTA
    const startButton = page.getByRole("link", { name: /start with avuno/i }).first();
    await startButton.click();

    // Should navigate to auth
    await expect(page).toHaveURL(/\/auth/, { timeout: 5000 });
  });

  test("footer has correct links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: /privacy/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /terms/i })).toBeVisible();
  });

  test("accessibility: keyboard navigation", async ({ page }) => {
    await page.goto("/");

    const mainCta = page.getByRole("link", { name: /start with avuno/i }).first();
    await mainCta.focus();

    // Check focus is visible
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Should be able to activate with Enter
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
  });

  test("reduced motion support", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Page should still load and be functional
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: /start with avuno/i }).first()).toBeVisible();
  });
});
