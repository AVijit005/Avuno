import { test, expect } from "@playwright/test";

const testEmail = "e2e_user@example.com";
const testPassword = "SuperSecurePassword123!";

test.describe("Phase 6B Visual & Structural QA", () => {
  test("Validates layout and removal of decorative elements in a single flow", async ({ page }) => {
    // Navigate to auth and login with standard seeded user
    await page.goto("http://localhost:5173/auth");
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    const submitBtn = page.getByRole("button", { name: "Continue", exact: true });
    await submitBtn.click();
    await page.waitForURL("**/app");

    // HOME PAGE: ensure decorative elements were removed (Phase 6B requirement)
    await expect(page.locator(".cinematic-hero")).toHaveCount(0);
    await expect(page.locator("text=Larger-than-life collections")).toHaveCount(0);
    await expect(page.locator(".text-gradient-aurora")).toHaveCount(0);
    await expect(page.locator("text=You aren't a list of titles.")).toHaveCount(0);
  });
});
