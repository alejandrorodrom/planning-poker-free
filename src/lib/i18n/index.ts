export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  detectLocaleFromAcceptLanguage,
  detectLocaleFromNavigator,
  isLocale,
  ogLocale,
  resolveLocale
} from './detect';
export {
  getLocale,
  getMessages,
  i18n,
  initLocale,
  setLocale,
  syncLocaleFromBrowser,
  t,
  te
} from './locale.svelte';
export type { Locale, Messages } from './types';
