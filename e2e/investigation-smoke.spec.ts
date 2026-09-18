import { test, expect } from "@playwright/test";

test.describe("Investigation smoke", () => {
  test("logged-out users are sent to authentication", async ({ page }) => {
    await page.goto("/investigations");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    await expect(
      page.locator('input[type="email"], input[name*="email" i], [data-clerk]')
        .first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test("investigation API is tenant-protected when logged out", async ({ request }) => {
    const list = await request.get("/api/v1/investigations");
    expect(list.status()).toBe(401);

    const review = await request.get(
      "/api/v1/investigations/does-not-exist/review",
    );
    expect(review.status()).toBe(401);
  });
});
