import { test, expect } from '@playwright/test';

test.describe('Proof page', () => {
  test('public proof page needs no login', async ({ page }) => {
    const response = await page.goto('/proof/demo');
    expect(response?.status() ?? 200).toBeLessThan(400);
    expect(page.url()).toContain('/proof');
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('not found');
    expect(bodyText).toMatch(/88[\s,.]?400/);
    expect(bodyText).toContain('Findings Detail');
    await expect(page.getByRole('link', { name: /start|trial|free/i })).toBeVisible();
  });
});
