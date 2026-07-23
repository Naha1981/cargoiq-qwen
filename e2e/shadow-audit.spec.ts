import { test, expect } from '@playwright/test';

// requires login — verified manually; Clerk Turnstile blocks automation
test.skip('demo audit runs and shows results', async ({ page }) => {
  await page.goto('/shadow-audit');
  await page.getByRole('button', { name: /run demo audit/i }).click();
  await expect(page.getByText(/88[\s,.]?400/)).toBeVisible({ timeout: 20_000 });
  const findingsText = await page.textContent('body');
  expect(findingsText).toMatch(/HS Code|Invoice|Packing|TMS|VAT|DA65|HPL/);
  await expect(page.getByRole('button', { name: /copy|share|proof/i })).toBeVisible();
});
