import { test, expect } from "@playwright/test";

const testEmail = "e2e_user@example.com";
const testPassword = "SuperSecurePassword123!";

test.describe("Authenticated User Journeys", () => {
  // Use a single test to walk through the journey to avoid rate limiting
  // on the login endpoint (3 requests per minute).
  test("should login and navigate through all core authenticated routes", async ({ page }) => {
    test.setTimeout(60000);
    // 1. Navigate to auth page
    await page.goto("/auth");

    // Wait for the page to load (should default to SignIn)
    const submitBtn = page.getByRole("button", { name: "Continue", exact: true }).first();
    await expect(submitBtn).toBeVisible({ timeout: 10000 });

    // 2. Fill in login form
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);

    // 3. Submit
    await submitBtn.click();

    // 4. Wait for successful navigation to app home
    await expect(page).toHaveURL(/\/(app|home)?$/, { timeout: 15000 });

    // 5. Library
    await page.goto("/app/library");
    await expect(page).toHaveURL(/\/app\/library/);
    await expect(page.getByRole("heading", { name: "Library" })).toBeVisible({ timeout: 10000 });

    // 6. Journal
    await page.goto("/app/journal");
    await expect(page).toHaveURL(/\/app\/journal/);
    await expect(page.getByRole("heading", { name: "Journal" })).toBeVisible({ timeout: 10000 });

    // 7. Memories
    await page.goto("/app/memories");
    await expect(page).toHaveURL(/\/app\/memories/);
    await expect(page.getByRole("heading", { name: "Memories" })).toBeVisible({ timeout: 10000 });

    // 8. Timeline
    await page.goto("/app/timeline");
    await expect(page).toHaveURL(/\/app\/timeline/);
    await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible({ timeout: 10000 });

    // 9. Analytics
    await page.goto("/app/analytics");
    await expect(page).toHaveURL(/\/app\/analytics/);
    await expect(page.locator("text=Library Insights")).toBeVisible({ timeout: 10000 });

    // 10. Logout
    await page.goto("/app/settings");
    await expect(page).toHaveURL(/\/app\/settings/);

    // Find and click the logout button
    const logoutBtn = page.getByRole("button", { name: "Log out of Avuno" });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Should redirect to auth/home
    await expect(page).toHaveURL(/\/(auth)?$/, { timeout: 10000 });
  });
});
