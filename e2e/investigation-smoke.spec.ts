import { test, expect } from "@playwright/test";

test.describe("Investigation smoke", () => {
  test("investigation workspace renders in CI browser mode", async ({ page }) => {
    await page.goto("/investigations");
    await expect(page.getByRole("heading", { name: "Investigate the money." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "New investigation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cases" })).toBeVisible();
  });

  test("investigation API remains tenant-protected when logged out", async ({ request }) => {
    const list = await request.get("/api/v1/investigations");
    expect(list.status()).toBe(401);

    const review = await request.get(
      "/api/v1/investigations/does-not-exist/review",
    );
    expect(review.status()).toBe(401);
  });
});
