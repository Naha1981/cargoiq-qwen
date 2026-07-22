import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return uuidv4();
}

export function formatZar(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatZarCents(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function normalizePhoneNumber(raw: string): string {
  let digits = raw.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  if (!digits.startsWith('27') && digits.startsWith('0')) {
    digits = '27' + digits.slice(1);
  }
  return digits;
}
