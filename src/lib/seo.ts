import type { Locale } from '$lib/i18n/types';

export const SITE_ORIGIN = 'https://planningpoker.free';

export const CANONICAL_HOST = 'planningpoker.free';

export const SITE_NAME = 'Planning Poker Free';

export const SITE_IMAGE_PATH = '/og-image-en.jpg';

export function siteImagePath(locale: Locale): string {
  return locale === 'es' ? '/og-image-es.jpg' : '/og-image-en.jpg';
}

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function isCanonicalHost(hostname: string): boolean {
  return hostname === CANONICAL_HOST;
}
