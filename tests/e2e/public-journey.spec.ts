import { expect, test } from "@playwright/test";

test("a visitor can start the account journey from the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "See a problem. Start the solution." })).toBeVisible();
  await page.getByRole("link", { name: "Report an issue" }).click();
  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
});

test("protected resident routes redirect anonymous visitors to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("registration displays the server validation error for a short password", async ({ page }) => {
  await page.goto("/sign-up");
  await page.locator("form").evaluate((form: HTMLFormElement) => { form.noValidate = true; });
  await page.getByLabel("Full name").fill("E2E Resident");
  await page.getByLabel("Email address").fill("e2e-resident@agapay.test");
  await page.getByLabel("Password", { exact: true }).fill("Abc1");
  await page.getByLabel("Confirm password").fill("Abc1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
});
