<script lang="ts">
  import { SITE_NAME, absoluteUrl, siteImagePath } from '$lib/seo';
  import { faqPageJsonLd, howToJsonLd, landingFaqItems } from '$lib/seo/landing-faq';
  import { getMessages, i18n, ogLocale, t } from '$lib/i18n';

  type Props = {
    indexable?: boolean;
  };

  let { indexable = true }: Props = $props();

  const canonical = absoluteUrl('/');
  const robots = $derived(indexable ? 'index, follow' : 'noindex, nofollow');
  const title = $derived(t('seo.title'));
  const description = $derived(t('seo.description'));
  const imageAlt = $derived(t('seo.imageAlt'));
  const og = $derived(ogLocale(i18n.locale));
  const image = $derived(absoluteUrl(siteImagePath(i18n.locale)));
  const faqLd = $derived(
    faqPageJsonLd(landingFaqItems(getMessages().landing), canonical)
  );
  const howToLd = $derived(howToJsonLd(getMessages().landing, canonical));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content={og} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={imageAlt} />

  {#if indexable}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD must be raw script text -->
    {@html `<script type="application/ld+json">${faqLd}</script>`}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD must be raw script text -->
    {@html `<script type="application/ld+json">${howToLd}</script>`}
  {/if}
</svelte:head>
