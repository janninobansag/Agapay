import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const [name, path] of [["landing page", "/"], ["sign-in page", "/sign-in"], ["sign-up page", "/sign-up"]] as const) {
  test(`@a11y ${name} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("@a11y keyboard focus is visible on the landing page", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Agapay home" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Agapay home" })).toHaveCSS("outline-style", "solid");
});
