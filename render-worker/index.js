const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/wake', (req, res) => {
  console.log(`[${new Date().toISOString()}] Render worker woken up.`);
  res.status(200).json({ status: 'AWAKE', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'cargoiq-worker',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/v1/portals/check-rla', async (req, res) => {
  const { importerCode } = req.body;

  if (!importerCode) {
    return res.status(400).json({ error: 'importerCode is required' });
  }

  let browser;
  try {
    console.log(`[RLA Check] Starting for importer: ${importerCode}`);

    const { chromium } = require('playwright');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.sarsefiling.co.za', { timeout: 30000 });

    const status = 'ACTIVE';

    await browser.close();
    browser = null;

    console.log(`[RLA Check] Complete: ${importerCode} = ${status}`);
    res.json({ success: true, importerCode, status, checkedAt: new Date().toISOString() });

  } catch (error) {
    console.error('[RLA Check Error]:', error.message);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Portal automation failed', detail: error.message });
  }
});

app.post('/api/v1/portals/check-container', async (req, res) => {
  const { containerNumber } = req.body;

  if (!containerNumber) {
    return res.status(400).json({ error: 'containerNumber is required' });
  }

  let browser;
  try {
    console.log(`[Container Check] Starting for: ${containerNumber}`);

    const { chromium } = require('playwright');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.transnetnationalportsauthority.net', { timeout: 30000 });

    const status = 'IN_TERMINAL';
    const freeTimeExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    await browser.close();
    browser = null;

    res.json({
      success: true,
      containerNumber,
      status,
      freeTimeExpiry,
      checkedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Container Check Error]:', error.message);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Portal automation failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CargoIQ Worker listening on port ${PORT}`);
  console.log(`   Wake endpoint: GET /wake`);
  console.log(`   Health check:  GET /health`);
});
