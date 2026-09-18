const baseUrl = (process.env.CARGOIQ_LOAD_TEST_URL || '').replace(/\/$/, '');
const tokens = (process.env.CARGOIQ_TEST_TOKENS || '').split(',').map((token) => token.trim()).filter(Boolean);
const nahaUrl = (process.env.NAHALLM_URL || '').replace(/\/$/, '');
const nahaKey = process.env.NAHALLM_API_KEY || '';
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY || tokens.length || 50);

if (!baseUrl) throw new Error('CARGOIQ_LOAD_TEST_URL is required');
if (tokens.length !== 50) throw new Error('CARGOIQ_TEST_TOKENS must contain exactly 50 tokens; received ' + tokens.length);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) throw new Error('LOAD_TEST_CONCURRENCY must be an integer from 1 to 50');

function percentile(values, p) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  const index = Math.min(ordered.length - 1, Math.ceil((p / 100) * ordered.length) - 1);
  return ordered[index];
}

async function timed(label, fn) {
  const started = performance.now();
  try {
    const result = await fn();
    return { label, ok: true, latencyMs: Math.round(performance.now() - started), result };
  } catch (error) {
    return { label, ok: false, latencyMs: Math.round(performance.now() - started), error: error instanceof Error ? error.message : String(error) };
  }
}

async function runBusiness(index, token) {
  const title = '50-business-load-' + String(index + 1).padStart(2, '0') + '-' + Date.now();
  const cargo = await timed('cargo-' + (index + 1), async () => {
    const create = await fetch(baseUrl + '/api/v1/investigations', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, disputeType: 'DEMURRAGE', baseCurrency: 'ZAR', notes: 'Automated 50-business pilot capacity test.' }),
    });
    const createBody = await create.json().catch(() => ({}));
    if (!create.ok) throw new Error('create ' + create.status + ': ' + JSON.stringify(createBody));
    const list = await fetch(baseUrl + '/api/v1/investigations', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
    const listBody = await list.json().catch(() => ({}));
    if (!list.ok) throw new Error('list ' + list.status + ': ' + JSON.stringify(listBody));
    const ownTitles = (listBody.data || []).map((item) => item.title);
    if (!ownTitles.includes(title)) throw new Error('tenant isolation/read-after-write check failed');
    return { ownTitlePresent: true, caseId: createBody?.data?.id ?? null };
  });

  let naha = null;
  if (nahaUrl && nahaKey) {
    naha = await timed('naha-' + (index + 1), async () => {
      const response = await fetch(nahaUrl + '/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + nahaKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'fast', messages: [{ role: 'user', content: 'CargoIQ pilot capacity probe ' + (index + 1) }] }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error('NahaLLM ' + response.status + ': ' + JSON.stringify(body));
      return { provider: body?.nahallm?.provider ?? null };
    });
  }

  return { cargo, naha };
}

const started = performance.now();
const results = [];
for (let offset = 0; offset < tokens.length; offset += concurrency) {
  const batch = tokens.slice(offset, offset + concurrency);
  const batchResults = await Promise.all(batch.map((token, batchIndex) => runBusiness(offset + batchIndex, token)));
  results.push(...batchResults);
}

const cargoRows = results.map((row) => row.cargo);
const nahaRows = results.map((row) => row.naha).filter(Boolean);
const cargoLatencies = cargoRows.map((row) => row.latencyMs);
const nahaLatencies = nahaRows.map((row) => row.latencyMs);
const cargoFailures = cargoRows.filter((row) => !row.ok);
const nahaFailures = nahaRows.filter((row) => !row.ok);

const report = {
  businesses: tokens.length,
  concurrency,
  elapsedMs: Math.round(performance.now() - started),
  cargoiq: { successes: cargoRows.filter((row) => row.ok).length, failures: cargoFailures.length, p50Ms: percentile(cargoLatencies, 50), p95Ms: percentile(cargoLatencies, 95), maxMs: Math.max(...cargoLatencies), failuresDetail: cargoFailures.slice(0, 10) },
  nahaLLM: nahaRows.length ? { enabled: true, successes: nahaRows.filter((row) => row.ok).length, failures: nahaFailures.length, p50Ms: percentile(nahaLatencies, 50), p95Ms: percentile(nahaLatencies, 95), maxMs: Math.max(...nahaLatencies), failuresDetail: nahaFailures.slice(0, 10) } : { enabled: false },
};

console.log(JSON.stringify(report, null, 2));
if (cargoFailures.length > 0) process.exit(1);
if (nahaUrl && nahaKey && nahaFailures.length > 0) process.exit(1);