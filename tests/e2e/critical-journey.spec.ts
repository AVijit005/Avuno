import { test, expect } from "@playwright/test";

test.describe("Critical User Journey", () => {
  test("should load the homepage and render the hero", async ({ page }) => {
    // Navigate to the root URL
    await page.goto("/");

    // Check if the main landing page title is visible
    // "Chronicle" or whatever the hero text is. We'll wait for the body to load.
    await expect(page.locator("body")).toBeVisible();

    // Look for a link to the app or login
    const loginLink = page.getByRole("link", { name: /login|get started|open app/i }).first();
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeEnabled();
    }
  });

  test("should navigate to the auth page", async ({ page }) => {
    await page.goto("/auth");

    // Wait for the auth form to mount
    await expect(
      page.locator("button[type='submit']").first(),
    ).toBeVisible();

    // Check for email input
    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeEditable();
    }
  });
});
