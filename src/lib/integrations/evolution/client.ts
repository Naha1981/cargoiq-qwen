const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

export function hasWhatsAppConfig(): boolean {
  return Boolean(EVOLUTION_API_URL && EVOLUTION_API_KEY && EVOLUTION_INSTANCE_NAME);
}

function base(): string {
  if (!EVOLUTION_API_URL) throw new Error('EVOLUTION_API_URL not configured');
  return EVOLUTION_API_URL.replace(/\/$/, '');
}

function headers(): Record<string, string> {
  if (!EVOLUTION_API_KEY) throw new Error('EVOLUTION_API_KEY not configured');
  return {
    'Content-Type': 'application/json',
    apikey: EVOLUTION_API_KEY,
  };
}

/**
 * Probe the Evolution gateway WITHOUT trusting env presence alone.
 * Returns real reachability + the live connectionState of the configured instance.
 * Never throws — returns a structured result so callers render honest states
 * (green reachable+open / amber not-configured / red unreachable).
 */
export interface GatewayHealth {
  reachable: boolean;          // gateway host itself responded
  configured: boolean;         // env vars present
  connectionState?: string;    // 'open' | 'close' | 'connecting' | unknown
  instance?: string;
  status?: string;             // Evolution instance status field
  error?: string;
}

export async function probeGatewayHealth(): Promise<GatewayHealth> {
  const configured = hasWhatsAppConfig();
  if (!configured) {
    return { reachable: false, configured: false, error: 'EVOLUTION_* env vars not set' };
  }
  try {
    const url = `${base()}/instance/connectionState/${EVOLUTION_INSTANCE_NAME}`;
    const res = await fetch(url, { method: 'GET', headers: headers() });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error');
      return {
        reachable: false,
        configured: true,
        instance: EVOLUTION_INSTANCE_NAME,
        error: `connectionState HTTP ${res.status}: ${errText.slice(0, 200)}`,
      };
    }
    const data = await res.json().catch(() => ({}));
    const instance = data?.instance?.instanceName ?? data?.instanceName ?? EVOLUTION_INSTANCE_NAME;
    const connectionState = data?.instance?.state ?? data?.state ?? data?.connectionState;
    const status = data?.instance?.status ?? data?.status;
    return {
      reachable: true,
      configured: true,
      instance,
      connectionState,
      status,
    };
  } catch (error) {
    return {
      reachable: false,
      configured: true,
      instance: EVOLUTION_INSTANCE_NAME,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Ensure the configured instance exists + connect it, then fetch the QR code.
 * Evolution returns a base64 QR PNG for the WhatsApp "Linked Devices" scanner.
 * Reuses the SAME env vars + apikey header convention as sendText below.
 * createInstance is idempotent (existing instance → reused), so this is safe to retry.
 */
export interface ConnectResult {
  ok: boolean;
  qr?: string;            // data URL ready to drop into <img src=...>
  base64?: string;        // raw base64 (no prefix) if that is what Evolution returned
  error?: string;
}

export async function connectInstanceAndFetchQr(): Promise<ConnectResult> {
  if (!hasWhatsAppConfig()) {
    return { ok: false, error: 'Evolution not configured (missing EVOLUTION_* env vars)' };
  }
  try {
    // 1. createInstance (idempotent — a 409/"already exists" is fine).
    await fetch(`${base()}/instance/create`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        instanceName: EVOLUTION_INSTANCE_NAME,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    }).catch(() => {});

    // 2. connect to produce a fresh QR.
    const connectRes = await fetch(`${base()}/instance/connect/${EVOLUTION_INSTANCE_NAME}`, {
      method: 'GET',
      headers: headers(),
    });
    if (!connectRes.ok) {
      const errText = await connectRes.text().catch(() => 'unknown error');
      return { ok: false, error: `connect HTTP ${connectRes.status}: ${errText.slice(0, 200)}` };
    }
    const data = await connectRes.json().catch(() => ({}));
    // Evolution v2 shape: { base64: { code } } | { qrcode: { code } } | { code } | { qrcode }
    const code =
      data?.base64?.code ??
      data?.qrcode?.code ??
      data?.code ??
      data?.qrcode ??
      undefined;
    if (!code) {
      // Instance may already be open → no QR offered. Surface that honestly.
      return { ok: false, error: 'No QR returned (instance may already be connected — refresh status)' };
    }
    const isDataUrl = /^data:image\/png;base64,/.test(code);
    const qr = isDataUrl ? code : `data:image/png;base64,${code}`;
    return { ok: true, qr, base64: code };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Log out the configured instance — tears down the active WhatsApp session so
 * another device can pair later. Does NOT delete the instance definition.
 */
export async function disconnectInstance(): Promise<{ ok: boolean; error?: string }> {
  if (!hasWhatsAppConfig()) {
    return { ok: false, error: 'Evolution not configured' };
  }
  try {
    const res = await fetch(`${base()}/instance/logout/${EVOLUTION_INSTANCE_NAME}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error');
      return { ok: false, error: `logout HTTP ${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendEvolutionText(number: string, text: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
    console.error('[Evolution Client]: Missing env vars — send skipped');
    return;
  }

  try {
    const url = `${EVOLUTION_API_URL.replace(/\/$/, '')}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ number, text }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown error');
      console.error(`[Evolution Client]: sendText failed ${res.status}`, errText);
    }
  } catch (error) {
    console.error('[Evolution Client]: sendText error', error);
  }
}
