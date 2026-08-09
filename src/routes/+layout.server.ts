import { LOCALE_COOKIE, resolveLocale } from '$lib/i18n';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ cookies, request }) => {
  const locale = resolveLocale({
    cookie: cookies.get(LOCALE_COOKIE),
    acceptLanguage: request.headers.get('accept-language')
  });

  return { locale };
};
