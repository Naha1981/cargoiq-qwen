import { test, expect } from '@playwright/test';

test.describe('Public onboarding surface — no login required', () => {
  test('signup page renders Clerk SignUp', async ({ page }) => {
    await page.goto('/signup');
    expect(page.url()).not.toContain('404');
    const body = await page.textContent('body');
    const hasClerk = (body?.toLowerCase().includes('secured by') || body?.toLowerCase().includes('clerk'));
    expect(hasClerk).toBeTruthy();
  });

  test('onboarding bounces to sign-in when unauthenticated', async ({ page }) => {
    const response = await page.goto('/onboarding');
    expect(response?.status() ?? 200).toBeLessThan(400);
    const url = page.url();
    expect(url).toContain('/login');
  });

  test('/proof/demo returns 200 with a Rand figure', async ({ page, request }) => {
    const response = await request.get('/proof/demo');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).toContain('<!DOCTYPE html>');
    await page.goto('/proof/demo');
    expect(page.url()).toContain('/proof');
    await expect(page.getByText(/88[\s,]?400/)).toBeVisible({ timeout: 10000 });
  });

  test('/shadow-audit bounces to sign-in when unauthenticated', async ({ page }) => {
    const response = await page.goto('/shadow-audit');
    expect(response?.status() ?? 200).toBeLessThan(400);
    const url = page.url();
    expect(url).toContain('/login');
  });
});
