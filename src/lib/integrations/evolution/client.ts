const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

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
