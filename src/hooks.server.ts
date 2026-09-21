import { isCanonicalHost, absoluteUrl } from '$lib/seo';
import { landingJsonLdHtml } from '$lib/seo/landing-faq';
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
  const path = event.url.pathname;
  const host = event.url.hostname;
  const jsonld =
    isCanonicalHost(host) && path === '/'
      ? landingJsonLdHtml(catalogs[locale].landing, absoluteUrl('/'))
      : '';

  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html
        .replace('%lang%', locale)
        .replace(/%description%/g, seo.description)
        .replace('%inLanguage%', locale)
        .replace('%jsonld%', jsonld)
  });

  // DO/WebSocket responses have immutable headers; never mutate them.
  if (
    path.includes('/ws') ||
    response.status === 101 ||
    ('webSocket' in response && response.webSocket)
  ) {
    return response;
  }

  if (!isCanonicalHost(host) || path.startsWith('/room') || path.startsWith('/api')) {
    try {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } catch {
      const headers = new Headers(response.headers);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
  }

  return response;
}
