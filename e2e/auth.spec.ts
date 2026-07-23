import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const isLocal = !process.env.BASE_URL || process.env.BASE_URL.includes('localhost') || process.env.BASE_URL.includes('127.0.0.1');

function uniqueEmail(): string {
  return `e2e-${Date.now()}@test.com`;
}
const PASSWORD = 'Zxcv!2026Qw';

async function interactWithClerkSignUp(page: import('@playwright/test').Page, email: string) {
  await page.goto('/signup');
  await page.waitForTimeout(1000);

  const emailLocator = page.locator(
    'input[type="email"], input[name*="email" i], input[placeholder*="email" i]'
  ).first();
  await expect(emailLocator).toBeVisible({ timeout: 15_000 });
  await emailLocator.fill(email);

  const passwordLocator = page.locator(
    'input[type="password"], input[name*="password" i], input[placeholder*="password" i]'
  ).first();
  if (await passwordLocator.isVisible({ timeout: 3000 }).catch(() => false)) {
    await passwordLocator.fill(PASSWORD);
  }

  const submitBtn = page.getByRole('button').filter({ hasText: /sign up|create|continue/i }).first();
  await submitBtn.click();

  const nameLocator = page.locator(
    'input[name*="name" i], input[placeholder*="name" i]'
  ).first();
  if (await nameLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nameLocator.fill('E2E Tester');
    await page.getByRole('button').filter({ hasText: /continue|sign up|create/i }).first().click();
  }
}

async function clerkSignIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.waitForTimeout(1000);

  const emailLocator = page.locator(
    'input[type="email"], input[name*="email" i], input[placeholder*="email" i]'
  ).first();
  await expect(emailLocator).toBeVisible({ timeout: 15_000 });
  await emailLocator.fill(email);

  const nextBtn = page.getByRole('button').filter({ hasText: /continue/i }).first();
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
  }

  const passwordLocator = page.locator(
    'input[type="password"], input[name*="password" i], input[placeholder*="password" i]'
  ).first();
  if (await passwordLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
    await passwordLocator.fill(PASSWORD);
    await page.getByRole('button').filter({ hasText: /sign in/i }).first().click();
  }

    await page.waitForURL(
      (url) => url.href.includes('/onboarding') || url.href.includes('/dashboard'),
      { timeout: 20_000 }
    );
}

// ------------------------------------------------------------------
// Tier 1 — Public + Lock (runs against whatever BASE_URL is)
// ------------------------------------------------------------------
test.describe('Tier 1 — Public + Lock (BASE_URL)', () => {
  test('homepage forbidden words (EXPECTED FAIL on prod until redesign)', async ({ page }) => {
    await page.goto('/');
    const body = await page.textContent('body');
    expect(body).not.toContain('HMRC');
    expect(body).not.toContain('SARB');
    expect(body).not.toContain('GPS-verified');
    expect(body).not.toContain('Road Logistics Agreements');
    expect(body).not.toContain('R0 a Month');
    expect(body).not.toContain('7-Day Shadow Audit');
    expect(body).not.toContain('7/8');
  });

  test('login page renders Clerk', async ({ page }) => {
    await page.goto('/login');
    expect(page.url()).not.toContain('404');
    const text = await page.textContent('body');
    const hasClerk = text?.toLowerCase().includes('secured by') ||
      text?.toLowerCase().includes('clerk') ||
      (await page.locator('input[type="email"], input[type="password"], #clerk-root, [data-clerk]').count()) > 0;
    expect(hasClerk).toBeTruthy();
  });

  test('signup page renders Clerk', async ({ page }) => {
    await page.goto('/signup');
    expect(page.url()).not.toContain('404');
    const text = await page.textContent('body');
    const hasClerk = text?.toLowerCase().includes('secured by') ||
      text?.toLowerCase().includes('clerk') ||
      (await page.locator('input[type="email"], input[type="password"], #clerk-root, [data-clerk]').count()) > 0;
    expect(hasClerk).toBeTruthy();
  });

  test('protected routes bounce when logged out', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/onboarding', '/queue', '/shadow-audit'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      const currentUrl = page.url();
      const body = await page.textContent('body') ?? '';
      const stillThere = currentUrl.includes(route);
      const showsSignIn = /sign in|sign-in|log in/i.test(body) || currentUrl.includes('/login') || currentUrl.includes('/sign-in');
      expect(stillThere).toBeFalsy();
    }
  });

  test('health + proof + selftest alive', async ({ request, page }) => {
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();
    expect((await health.json()).status).toBe('healthy');

    const proofResp = await request.get('/proof/demo');
    expect(proofResp.ok()).toBeTruthy();
    const proofHtml = await proofResp.text();
    expect(proofHtml).toContain('<!DOCTYPE html>');

    await page.goto('/proof/demo');
    expect(page.url()).toContain('/proof');
    await expect(page.getByText(/88[\s,]?400/)).toBeVisible({ timeout: 60_000 });

    const selftest = await request.post('/api/v1/selftest', { data: {} });
    expect(selftest.ok()).toBeTruthy();
  });
});

// ------------------------------------------------------------------
// Tier 2 — Logged-in Human Flow (LOCAL only) [SKIPPED]
// Reason: Cannot reliably mint a Clerk session programmatically.
//   A) Clerk Backend API POST /v1/users rejects request body formats
//      (tested: email_address, email_addresses, minimal bodies — all 422).
//   B) Browser <SignUp> form embeds Cloudflare Turnstile (Error: 300030),
//      which blocks automated form completion.
//   Neither path is reliable within this scope; no fake green.
// ------------------------------------------------------------------
test.describe('Tier 2 — Logged-in Human Flow (LOCAL only) [SKIPPED]', () => {
  test('preflight — tier 2 skipped, reason documented in spec header', async () => {
    test.skip(
      true,
      'Tier 2 skipped: Clerk Backend API rejects user creation payload; ' +
      'Cloudflare Turnstile blocks automated <SignUp> completion.'
    );
    expect(true).toBe(true);
  });
});
