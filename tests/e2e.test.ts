import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 1000 } });

test.describe('Chronicle E2E', () => {
  test.setTimeout(120000); // 2 minutes for Vite prebundling

  test('auth, dashboard, and analytics flow', async ({ page }) => {
    // 1. Sign up
    await page.goto('http://127.0.0.1:5173/auth', { timeout: 60000, waitUntil: 'domcontentloaded' });
    
    // Wait for React hydration
    await page.waitForTimeout(5000);
    
    // Switch to Sign Up mode (retry loop in case hydration swallowed the click or animation stalled)
    for (let i = 0; i < 5; i++) {
      await page.getByText('Create Account').click({ force: true });
      try {
        await page.locator('input[name="fullName"]').waitFor({ state: 'visible', timeout: 2000 });
        break; // found it!
      } catch (e) {
        // retry
      }
    }
    
    // Fill form
    const testEmail = `testuser${Date.now()}@example.com`;
    await page.getByLabel('Full Name', { exact: true }).fill('E2E Test User', { timeout: 5000 });
    await page.getByLabel('Email', { exact: true }).fill(testEmail, { timeout: 5000 });
    await page.getByLabel('Password', { exact: true }).fill('password1234', { timeout: 5000 });
    await page.getByLabel('Confirm Password', { exact: true }).fill('password1234', { timeout: 5000 });
    
    await page.screenshot({ path: 'artifacts/before-submit.png' });
    
    // Submit
    await page.getByRole('button', { name: 'Begin Chronicle' }).click();
    
    // Wait for redirect to dashboard
    try {
      await page.waitForURL(/\/app(\/|$)/, { timeout: 15000 });
      await page.waitForLoadState('domcontentloaded');
    } catch (error) {
      await page.screenshot({ path: 'artifacts/error-waitforurl.png' });
      const html = await page.content();
      console.error("Failed to redirect! Current URL:", page.url());
      console.error("Page HTML:", html);
      throw error;
    }
    
    // Verify dashboard doesn't have broken mock data references in its main content
    // We specifically check the main dashboard area, not the whole body which might have Interstellar in the sidebar or something (though it shouldn't)
    await expect(page.locator('main')).not.toContainText('Interstellar', { timeout: 15000 });
    await page.screenshot({ path: 'artifacts/dashboard.png' });
    
    // 2. Navigate to Analytics
    await page.getByRole('link', { name: 'Insights', exact: true }).first().click();
    
    // Verify analytics loads
    await expect(page.locator('main')).not.toContainText('Succession', { timeout: 15000 });
    await page.screenshot({ path: 'artifacts/analytics.png' });
  });
});
