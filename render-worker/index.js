const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

function tryLoadPlaywright() {
  try { return require('playwright-core'); }
  catch (e1) { try { return require('playwright'); } catch (e2) { return null; } }
}
const playwrightPkgPresent = (() => { try { return !!tryLoadPlaywright(); } catch (e) { return false; } })();

app.get('/', (req, res) => res.json({
  service: 'cargoiq-worker',
  status: 'up',
  portalAutomation: playwrightPkgPresent ? 'package-present-but-browsers-not-installed-on-free-tier' : 'dormant',
  hint: 'GET /wake to keep alive, GET /health for status'
}));

app.get('/wake', (req, res) => {
  console.log('[' + new Date().toISOString() + '] wake ping received');
  res.json({ status: 'AWAKE', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => res.json({
  status: 'healthy',
  service: 'cargoiq-worker',
  uptime: process.uptime(),
  playwrightPkgPresent,
  browsersInstalled: false,
  timestamp: new Date().toISOString()
}));

async function withBrowser(handler) {
  const pw = tryLoadPlaywright();
  if (!pw) return { ok: false, error: 'Portal automation not enabled on this deployment (no Playwright browser binaries on free tier). /wake and /health still work.' };
  let browser;
  try {
    browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const result = await handler(browser);
    return Object.assign({ ok: true }, result);
  } catch (e) {
    return { ok: false, error: 'Browser launch/automation failed (expected on Render free tier without browser binaries): ' + e.message };
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
}

app.post('/api/v1/portals/check-rla', async (req, res) => {
  const importerCode = (req.body || {}).importerCode;
  if (!importerCode) return res.status(400).json({ error: 'importerCode required' });
  const out = await withBrowser(async () => ({ importerCode, status: 'ACTIVE', note: 'stub' }));
  res.json(Object.assign({ checkedAt: new Date().toISOString() }, out));
});

app.post('/api/v1/portals/check-container', async (req, res) => {
  const containerNumber = (req.body || {}).containerNumber;
  if (!containerNumber) return res.status(400).json({ error: 'containerNumber required' });
  const out = await withBrowser(async () => ({ containerNumber, status: 'IN_TERMINAL', note: 'stub' }));
  res.json(Object.assign({ checkedAt: new Date().toISOString() }, out));
});

app.listen(PORT, () => {
  console.log('CargoIQ worker listening on :' + PORT + ' | playwrightPkgPresent=' + playwrightPkgPresent + ' | browsersInstalled=false (by design on free tier)');
});
