import type { Locale } from './types';

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALES: Locale[] = ['en', 'es'];
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'es';
}

export function detectLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const preferred = header.split(',')[0]?.split('-')[0]?.trim().toLowerCase();
  return isLocale(preferred) ? preferred : null;
}

export function detectLocaleFromNavigator(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  const preferred = navigator.language.split('-')[0]?.toLowerCase();
  return isLocale(preferred) ? preferred : null;
}

export function resolveLocale(options: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  navigatorLocale?: Locale | null;
}): Locale {
  if (options.cookie && isLocale(options.cookie)) return options.cookie;
  const fromAccept = detectLocaleFromAcceptLanguage(options.acceptLanguage ?? null);
  if (fromAccept) return fromAccept;
  if (options.navigatorLocale) return options.navigatorLocale;
  return DEFAULT_LOCALE;
}

export function ogLocale(locale: Locale): string {
  return locale === 'es' ? 'es_ES' : 'en_US';
}
