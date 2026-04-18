import { test, expect } from "@playwright/test";

test.describe("inspect_tool CTA scroll animation", () => {
  test("body data-cta-scroll is set and topbar CTA has CSS animation after scroll", async ({ page }) => {
    await page.goto("/inspect_tool");
    await page.waitForFunction(() => document.body.hasAttribute("data-cta-scroll"));

    const zoneAtTop = await page.evaluate(() => document.body.getAttribute("data-cta-scroll"));
    expect(zoneAtTop).toBeTruthy();

    const animBefore = await page.locator(".topbar-cta").first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration };
    });
    expect(animBefore.name).not.toBe("none");
    expect(parseFloat(animBefore.duration)).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    await page.waitForFunction(() => document.body.getAttribute("data-cta-scroll") === "faq-section");

    const animAfter = await page.locator(".topbar-cta").first().evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, zone: document.body.getAttribute("data-cta-scroll") };
    });
    expect(animAfter.zone).toBe("faq-section");
    expect(animAfter.name).not.toBe("none");
  });
});
