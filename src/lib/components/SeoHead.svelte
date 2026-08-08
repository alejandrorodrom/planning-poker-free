<script lang="ts">
  import {
    SITE_DESCRIPTION,
    SITE_IMAGE_ALT,
    SITE_IMAGE_PATH,
    SITE_NAME,
    SITE_TITLE,
    absoluteUrl
  } from '$lib/seo';

  type Props = {
    /** Use index only on the canonical production host. */
    indexable?: boolean;
  };

  let { indexable = true }: Props = $props();

  const canonical = absoluteUrl('/');
  const image = absoluteUrl(SITE_IMAGE_PATH);
  const robots = $derived(indexable ? 'index, follow' : 'noindex, nofollow');
</script>

<svelte:head>
  <title>{SITE_TITLE}</title>
  <meta name="description" content={SITE_DESCRIPTION} />
  <meta name="robots" content={robots} />
  <link rel="canonical" href={canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={SITE_TITLE} />
  <meta property="og:description" content={SITE_DESCRIPTION} />
  <meta property="og:image" content={image} />
  <meta property="og:image:alt" content={SITE_IMAGE_ALT} />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={SITE_TITLE} />
  <meta name="twitter:description" content={SITE_DESCRIPTION} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={SITE_IMAGE_ALT} />
</svelte:head>
