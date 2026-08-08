/** Canonical production origin — only this host should be indexed. */
export const SITE_ORIGIN = 'https://planningpoker.free';

export const SITE_NAME = 'Planning Poker Free';

export const SITE_TITLE = 'Planning Poker Free — estimación ágil en tiempo real';

export const SITE_DESCRIPTION =
  'Planning Poker Free: estima historias de usuario en tiempo real con tu equipo Scrum. Sin cuentas, salas por enlace y open source.';

export const SITE_IMAGE_PATH = '/og-image.jpg';

export const SITE_IMAGE_ALT =
  'Planning Poker — estimación ágil en tiempo real, simple y sin registro';

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function isCanonicalHost(hostname: string): boolean {
  return hostname === 'planningpoker.free' || hostname === 'www.planningpoker.free';
}
