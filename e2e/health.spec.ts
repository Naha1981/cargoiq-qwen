import { test, expect } from '@playwright/test';

test.describe('API health', () => {
  test('health endpoint returns healthy', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('cargoiq');
  });
});
