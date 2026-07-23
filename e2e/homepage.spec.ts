import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function getRenderedBodyText(page: any) {
    await expect(page.getByRole('heading', { name: /Built for Freight Operations/i })).toBeVisible();
    return await page.locator('body').innerText();
  }

  test('hero shows the real number (not R0)', async ({ page }) => {
    const heroHeading = page.locator('h1').filter({ hasText: /Stop Losing/ });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/R217[\s,.]?340/);
    const bodyText = await getRenderedBodyText(page);
    expect(bodyText).not.toContain('R0 a Month');
  });

  test('no forbidden claims anywhere', async ({ page }) => {
    const bodyText = await getRenderedBodyText(page);
    expect(bodyText).not.toContain('HMRC');
    expect(bodyText).not.toContain('SARB');
    expect(bodyText).not.toContain('GPS-verified');
    expect(bodyText).not.toContain('Road Logistics Agreements');
    expect(bodyText).not.toContain('7-Day Shadow Audit');
    expect(bodyText).not.toContain('R0 a Month');
    expect(bodyText).not.toContain('7/8');
  });

  test('corrected copy is present', async ({ page }) => {
    const bodyText = await getRenderedBodyText(page);
    expect(bodyText).toContain('SARS');
    expect(bodyText).toMatch(/25\s*%/);
    expect(bodyText).toContain('Carrier Invoices With Errors');
    expect(bodyText).toContain('WhatsApp');
    expect(bodyText).toContain('Registered Local Agent');
    expect(bodyText).toMatch(/SACU|DA65|TMS/);
  });

  test('pricing tiers render', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Growth' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
  });

  test('how-it-works names real checks', async ({ page }) => {
    const bodyText = await getRenderedBodyText(page);
    expect(bodyText).toMatch(/HS codes/);
    expect(bodyText).toMatch(/SACU|DA65|TMS/);
  });
});
