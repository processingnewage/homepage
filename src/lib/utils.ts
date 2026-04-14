import { type ClassValue, clsx } from "clsx";

export const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export function getMonthName(month: number | string | undefined): string {
  if (!month) return '';
  const monthNum = typeof month === 'string' ? parseInt(month) : month;
  return months[monthNum - 1] || '';
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeLocale(locale: string): string {
  return locale.trim().replace('_', '-').toLowerCase();
}
