import type { DemurrageInput, DemurrageResult } from "./types.ts";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function assertDateOnly(value: string, field: string): Date {
  if (!DATE_ONLY.test(value)) {
    throw new Error(`INVALID_${field.toUpperCase()}: expected YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`INVALID_${field.toUpperCase()}: invalid calendar date`);
  }
  return date;
}

function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + count);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function calculateDemurrage(input: DemurrageInput): DemurrageResult {
  if (!Number.isInteger(input.freeDays) || input.freeDays < 0) {
    throw new Error("INVALID_FREE_DAYS");
  }
  if (!Number.isSafeInteger(input.dailyRateMinor) || input.dailyRateMinor < 0) {
    throw new Error("INVALID_DAILY_RATE_MINOR");
  }
  if (!/^[A-Z]{3}$/.test(input.currency)) {
    throw new Error("INVALID_CURRENCY");
  }

  const start = assertDateOnly(input.chargeStart, "chargeStart");
  const end = assertDateOnly(input.chargeEnd, "chargeEnd");
  if (end < start) throw new Error("INVALID_DATE_RANGE");

  const holidays = new Set((input.holidayDates ?? []).map((date) => {
    assertDateOnly(date, "holidayDate");
    return date;
  }));

  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor = addDays(cursor, 1);
  }

  const eligible = dates.filter((date) => {
    const day = assertDateOnly(date, "eligibleDate");
    if (input.weekendBillable === false && isWeekend(day)) return false;
    if (holidays.has(date)) return false;
    return true;
  });

  const chargeableDates = eligible.slice(Math.min(input.freeDays, eligible.length));

  if (
    input.dailyRateMinor > 0 &&
    chargeableDates.length > Math.floor(Number.MAX_SAFE_INTEGER / input.dailyRateMinor)
  ) {
    throw new Error("DEMURRAGE_RESULT_EXCEEDS_SAFE_INTEGER");
  }

  return {
    totalDays: dates.length,
    freeDaysApplied: Math.min(input.freeDays, eligible.length),
    chargeableDays: chargeableDates.length,
    amountMinor: chargeableDates.length * input.dailyRateMinor,
    currency: input.currency,
    dailyRateMinor: input.dailyRateMinor,
    chargeableDates,
    assumptions: [
      "Charge window is inclusive of both start and end dates.",
      "Free days are consumed before chargeable days.",
      input.weekendBillable === false
        ? "Weekend days are excluded from billable time."
        : "Weekend days are billable unless the applicable commercial rule says otherwise.",
      holidays.size > 0
        ? "Supplied public-holiday dates are excluded from billable time."
        : "No public-holiday exclusions were supplied.",
    ],
  };
}
