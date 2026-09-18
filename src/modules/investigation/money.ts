export function moneyToMinor(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const minor = Math.round(value * 100);
    return Number.isSafeInteger(minor) ? minor : undefined;
  }

  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .replace(/[R$€£]/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, "");

  if (!/^-?\d+(?:\.\d{1,2})?$/.test(normalized)) return undefined;

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [whole, fraction = ""] = unsigned.split(".");
  const minor = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(minor)) return undefined;
  return negative ? -minor : minor;
}
