import { isCanonicalHost } from '$lib/seo';

export async function handle({
  event,
  resolve
}: {
  event: { url: URL };
  resolve: (event: { url: URL }) => Promise<Response>;
}): Promise<Response> {
  const response = await resolve(event);

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
