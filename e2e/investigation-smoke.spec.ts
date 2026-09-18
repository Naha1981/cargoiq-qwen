import { test, expect } from "@playwright/test";

test.describe("Investigation smoke", () => {
  test("investigation workspace renders in CI browser mode", async ({ page }) => {
    await page.goto("/investigations");
    await expect(page.getByRole("heading", { name: "Investigate the money." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "New investigation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cases" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create investigation" })).toBeVisible();
  });

  test("health endpoint is reachable from the browser", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("cargoiq");
  });
});
