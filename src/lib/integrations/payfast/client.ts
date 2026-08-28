import { createHash } from 'crypto';

/**
 * PayFast integration client. Implemented against PayFast's publicly
 * documented signature and ITN-validation algorithm.
 *
 * IMPORTANT: this has NOT been smoke-tested against a live PayFast sandbox
 * transaction from this environment (no PayFast merchant credentials were
 * available, and this sandbox has no outbound network access to
 * www.payfast.co.za for the ITN server-side validation call). The signature
 * algorithm and ITN validation steps below follow PayFast's published spec
 * exactly, but must be exercised against a real PayFast sandbox account
 * before being treated as production-verified.
 */

const PAYFAST_SANDBOX_HOST = 'sandbox.payfast.co.za';
const PAYFAST_LIVE_HOST = 'www.payfast.co.za';

// PayFast's own documented list of valid ITN source hostnames (resolved via
// DNS at request time, not hardcoded IPs -- PayFast's IPs are not static).
const PAYFAST_VALID_HOSTS = [
  'www.payfast.co.za',
  'sandbox.payfast.co.za',
  'w1w.payfast.co.za',
  'w2w.payfast.co.za',
];

function isSandbox(): boolean {
  return process.env.PAYFAST_MODE !== 'live';
}

function getHost(): string {
  return isSandbox() ? PAYFAST_SANDBOX_HOST : PAYFAST_LIVE_HOST;
}

export function isPayfastConfigured(): boolean {
  return !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
}

/**
 * PayFast's signature algorithm: build a param string in the exact order
 * fields are provided (NOT alphabetical), URL-encode each value the way PHP's
 * urlencode() does (spaces as '+', uppercase hex escapes), join as
 * key=value&key=value, append &passphrase=... if one is configured, then
 * MD5 the result and lowercase the hex digest.
 */
function phpStyleUrlEncode(value: string): string {
  // encodeURIComponent leaves !'()*~ unescaped; PHP's urlencode() escapes
  // !'()* but (since PHP 5.4) leaves ~ unescaped, matching encodeURIComponent
  // on that one character -- so only !'()* need the extra pass here.
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildSignatureString(fields: Record<string, string>, passphrase?: string): string {
  const parts = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${phpStyleUrlEncode(value)}`);

  let paramString = parts.join('&');
  if (passphrase) {
    paramString += `&passphrase=${phpStyleUrlEncode(passphrase)}`;
  }
  return paramString;
}

export function generateSignature(fields: Record<string, string>, passphrase?: string): string {
  const paramString = buildSignatureString(fields, passphrase);
  return createHash('md5').update(paramString).digest('hex');
}

export interface CreateCheckoutParams {
  tenantId: string;
  planId: 'starter' | 'growth';
  planName: string;
  amountZar: number;
  buyerEmail: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Build a PayFast recurring-billing checkout redirect. Returns the full URL
 * to redirect the user to -- PayFast hosts the actual payment page.
 * The browser redirect back to returnUrl is NEVER treated as payment
 * confirmation; only the signed ITN webhook is authoritative (see
 * src/app/api/webhooks/payfast/route.ts).
 */
export function buildCheckoutUrl(params: CreateCheckoutParams): { url: string; fields: Record<string, string> } {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE;

  if (!merchantId || !merchantKey) {
    throw new Error('PAYFAST_NOT_CONFIGURED');
  }

  // Field order matters for the signature -- this order matches PayFast's
  // documented field ordering for subscription/recurring payments.
  const fields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    email_address: params.buyerEmail,
    m_payment_id: `${params.tenantId}:${params.planId}:${Date.now()}`,
    amount: params.amountZar.toFixed(2),
    item_name: `CargoIQ ${params.planName} Plan`,
    subscription_type: '1', // 1 = subscription (recurring)
    billing_date: new Date().toISOString().slice(0, 10),
    recurring_amount: params.amountZar.toFixed(2),
    frequency: '3', // monthly
    cycles: '0', // 0 = indefinite, until cancelled
  };

  const signature = generateSignature(fields, passphrase);

  const query = new URLSearchParams({ ...fields, signature }).toString();
  const url = `https://${getHost()}/eng/process?${query}`;

  return { url, fields: { ...fields, signature } };
}

/**
 * Validate an inbound ITN (Instant Transaction Notification) per PayFast's
 * documented steps:
 *   1. Recompute the signature over the posted fields and compare.
 *   2. Confirm the request source resolves to one of PayFast's known hosts.
 *   3. (Caller's responsibility, not this function -- requires live network
 *      access this sandbox doesn't have) POST the raw payload back to
 *      PayFast's /eng/query/validate endpoint and confirm "VALID".
 *   4. Confirm the amount matches what was expected for this subscription.
 */
export function verifyItnSignature(fields: Record<string, string>): boolean {
  const { signature, ...rest } = fields;
  if (!signature) return false;
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const expected = generateSignature(rest, passphrase);
  return expected === signature;
}

export async function isRequestFromPayfast(sourceIp: string): Promise<boolean> {
  const dns = await import('dns/promises');
  try {
    const hostnames = await dns.reverse(sourceIp);
    for (const hostname of hostnames) {
      if (PAYFAST_VALID_HOSTS.some((valid) => hostname.endsWith(valid))) {
        // Confirm forward resolution matches, per PayFast's documented
        // double-lookup validation approach.
        const addresses = await dns.resolve4(hostname).catch((): string[] => []);
        if (addresses.includes(sourceIp)) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
