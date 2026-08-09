import { isCanonicalHost } from '$lib/seo';
import { LOCALE_COOKIE, resolveLocale } from '$lib/i18n/detect';
import { en } from '$lib/i18n/en';
import { es } from '$lib/i18n/es';

const catalogs = { en, es } as const;

export async function handle({
  event,
  resolve
}: {
  event: {
    url: URL;
    cookies: { get: (name: string) => string | undefined };
    request: Request;
  };
  resolve: (
    event: {
      url: URL;
      cookies: { get: (name: string) => string | undefined };
      request: Request;
    },
    opts?: {
      transformPageChunk?: (input: { html: string }) => string;
    }
  ) => Promise<Response>;
}): Promise<Response> {
  const locale = resolveLocale({
    cookie: event.cookies.get(LOCALE_COOKIE),
    acceptLanguage: event.request.headers.get('accept-language')
  });
  const seo = catalogs[locale].seo;

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replace('%lang%', locale)
        .replace(/%description%/g, seo.description)
        .replace('%inLanguage%', locale)
  });

  if (response.status === 101 || ('webSocket' in response && response.webSocket)) {
    return response;
  }

  const path = event.url.pathname;
  const host = event.url.hostname;

  if (!isCanonicalHost(host) || path.startsWith('/room') || path.startsWith('/api')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}
