import { expect, test } from "@playwright/test";

test("@performance landing page stays within the production performance budget", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "load" });
  expect(response?.ok()).toBe(true);

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd ?? Number.POSITIVE_INFINITY,
      load: navigation?.loadEventEnd ?? Number.POSITIVE_INFINITY,
      resourceCount: resources.length,
      transferredBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
    };
  });

  expect(metrics.domContentLoaded).toBeLessThan(2_500);
  expect(metrics.load).toBeLessThan(4_000);
  expect(metrics.resourceCount).toBeLessThan(80);
  expect(metrics.transferredBytes).toBeLessThan(1_500_000);
});
