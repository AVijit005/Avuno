import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();
const testEmail = "e2e_user@example.com";
const testPassword = "SuperSecurePassword123!";

test.describe("Authenticated User Journeys", () => {
  test.beforeAll(async () => {
    // Seed the user in the database
    const passwordHash = await hash(testPassword);
    
    await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        passwordHash,
        emailVerified: new Date(),
      },
      create: {
        email: testEmail,
        passwordHash,
        name: "E2E Test User",
        emailVerified: new Date(),
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    // 1. Navigate to auth page
    await page.goto("/auth");

    // Wait for the Sign In form to mount
    const submitBtn = page.getByRole("button", { name: "Continue" });
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500); // Let animation settle

    // 2. Fill in login form 
    await page.getByPlaceholder("Enter email").fill(testEmail);
    await page.getByPlaceholder("Enter password").fill(testPassword);

    // 3. Submit
    await submitBtn.click();
    
    // Wait for successful navigation to app home
    await expect(page).toHaveURL(/\/(app|home)?$/, { timeout: 15000 });
  });

  test("should load library", async ({ page }) => {
    await page.goto("/app/library");
    await expect(page).toHaveURL(/\/app\/library/);
    
    // Check for some element on the library page
    await expect(page.locator("text=Your personal media sanctuary").first()).toBeVisible({ timeout: 5000 });
  });
});
