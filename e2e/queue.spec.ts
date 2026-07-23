import { test, expect } from '@playwright/test';

// requires login — verified manually; Clerk Turnstile blocks automation
test.skip('queue loads and shows shipments', async ({ page }) => {
  await page.goto('/queue');
  await expect(page.getByRole('heading', { name: /shipment queue/i })).toBeVisible();
  const bodyText = await page.textContent('body');
  expect(bodyText).toMatch(/CIQ-2026/);
  expect(bodyText).toMatch(/shipper|consignee|reference|status/i);
});
