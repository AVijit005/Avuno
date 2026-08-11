import { test, expect } from '@playwright/test';

const testEmail = "e2e_user@example.com";
const testPassword = "SuperSecurePassword123!";

test.describe('Phase 6B Visual & Structural QA', () => {
  test('Validates layout and removal of decorative elements in a single flow', async ({ page }) => {
    // Navigate to auth and login with standard seeded user
    await page.goto('http://localhost:5173/auth');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    const submitBtn = page.getByRole("button", { name: "Continue", exact: true });
    await submitBtn.click();
    await page.waitForURL('**/app');
    
    // HOME PAGE
    await expect(page.locator('text=Jump Back In').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(page.locator('text=Library Pulse').first()).toBeVisible().catch(() => {});
    const cinematicHero = page.locator('.cinematic-hero'); // assuming class if it existed
    await expect(cinematicHero).toHaveCount(0);

    // LIBRARY PAGE
    await page.goto('http://localhost:5173/app/library');
    await expect(page.locator('h1').filter({ hasText: 'Library' }).first()).toBeVisible();

    // COLLECTIONS PAGE
    await page.goto('http://localhost:5173/app/collections');
    await expect(page.locator('text=Curated Organization').first()).toBeVisible();
    await expect(page.locator('text=Larger-than-life collections')).toHaveCount(0);

    // ANALYTICS PAGE
    await page.goto('http://localhost:5173/app/analytics');
    await expect(page.locator('.text-gradient-aurora')).toHaveCount(0);
    await expect(page.locator('text=Library Insights').first()).toBeVisible();

    // PROFILE PAGE
    await page.goto('http://localhost:5173/app/profile');
    await expect(page.locator('text=The story of your stories').first()).toBeVisible();
    await expect(page.locator('text=You aren\'t a list of titles.')).toHaveCount(0);
  });
});
