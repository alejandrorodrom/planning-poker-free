import type { ErrorCode } from '$lib/errors';
import { en } from './en';
import { es } from './es';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale } from './detect';
import type { Locale, Messages } from './types';

const catalogs: Record<Locale, Messages> = { en, es };
const isBrowser = typeof document !== 'undefined';

export const i18n = $state({
  locale: DEFAULT_LOCALE as Locale
});

export function getLocale(): Locale {
  return i18n.locale;
}

export function initLocale(next: Locale): void {
  if (LOCALES.includes(next)) i18n.locale = next;
}

export function setLocale(next: Locale): void {
  if (!LOCALES.includes(next) || i18n.locale === next) return;
  i18n.locale = next;
  if (isBrowser) {
    document.documentElement.lang = next;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    localStorage.setItem(LOCALE_COOKIE, next);
  }
}

export function syncLocaleFromBrowser(): void {
  if (!isBrowser) return;
  const stored = localStorage.getItem(LOCALE_COOKIE);
  if (stored && isLocale(stored)) {
    setLocale(stored);
    return;
  }
  const nav = navigator.language.split('-')[0]?.toLowerCase();
  if (isLocale(nav)) setLocale(nav);
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

function getNested(messages: Messages, path: string): string | undefined {
  let current: unknown = messages;
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(path: string, params: Record<string, string | number> = {}): string {
  const _ = i18n.locale;
  const value = getNested(catalogs[i18n.locale], path);
  if (value === undefined) return path;
  return interpolate(value, params);
}

export function te(code: ErrorCode): string {
  const _ = i18n.locale;
  return catalogs[i18n.locale].errors[code] ?? code;
}

export function getMessages(): Messages {
  const _ = i18n.locale;
  return catalogs[i18n.locale];
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale } from './detect';
export type { Locale, Messages } from './types';
