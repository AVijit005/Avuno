import { test, expect } from "@playwright/test";

test("auth page loads and toggle works", async ({ page }) => {
  await page.goto("/auth");

  // Expect title to be Welcome back initially
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  // Click the Sign Up tab
  await page.getByRole("button", { name: "Sign Up" }).click();

  // Expect title to change to Join Avuno
  await expect(page.getByRole("heading", { name: "Join Avuno" })).toBeVisible();

  // Sign up form should have Full Name input
  await expect(page.getByLabel("Full Name")).toBeVisible();
});
