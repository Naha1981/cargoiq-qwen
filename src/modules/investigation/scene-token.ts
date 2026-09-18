import { createHmac, timingSafeEqual } from "node:crypto";

type SceneTokenPayload = {
  caseId: string;
  exp: number;
};

function secret() {
  const value = process.env.CARGOiQ_GEV_SCENE_SECRET;
  if (!value) throw new Error("CARGOiQ_GEV_SCENE_SECRET_NOT_CONFIGURED");
  return value;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createSceneToken(caseId: string, ttlSeconds = 900) {
  const payload: SceneTokenPayload = {
    caseId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = encode(payload);
  return `${body}.${sign(body)}`;
}

export function verifySceneToken(token: string): SceneTokenPayload | null {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SceneTokenPayload;
    if (!payload?.caseId || !Number.isInteger(payload.exp) || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
