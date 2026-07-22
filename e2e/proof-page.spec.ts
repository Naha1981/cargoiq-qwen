import { test, expect } from '@playwright/test';

test.describe('Proof page', () => {
  test('public proof page needs no login', async ({ page }) => {
    const response = await page.goto('/proof/demo');
    expect(response?.status() ?? 200).toBeLessThan(400);
    expect(page.url()).toContain('/proof');
    await expect(page.getByRole('heading', { name: 'CargoIQ' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Proof not found' })).not.toBeVisible();
    await expect(page.getByText(/88[\s,]?400/)).toBeVisible();
    await expect(page.getByText('Findings Detail')).toBeVisible();
    await expect(page.getByRole('link', { name: /start|trial|free/i })).toBeVisible();
  });
});
