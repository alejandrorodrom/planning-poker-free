<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import '$lib/styles/global.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { initLocale, syncLocaleFromBrowser } from '$lib/i18n';
  import montserrat400 from '@fontsource/montserrat/files/montserrat-latin-400-normal.woff2?url';
  import pattaya400 from '@fontsource/pattaya/files/pattaya-latin-400-normal.woff2?url';

  let { data, children } = $props();

  $effect.pre(() => {
    initLocale(data.locale);
  });

  $effect(() => {
    if (!browser) return;
    syncLocaleFromBrowser();
    document.documentElement.lang = data.locale;
  });

  const hideNavbar = $derived(
    page.route.id === '/' || Boolean(page.route.id?.startsWith('/room'))
  );
  const roomFooter = $derived(Boolean(page.route.id?.startsWith('/room')));
</script>

<svelte:head>
  <link rel="preload" href={pattaya400} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={montserrat400} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="app-shell">
  {#if !hideNavbar}
    <Navbar />
  {/if}
  <main class="app-shell__main">
    {@render children()}
  </main>
  <Footer compact={roomFooter} />
</div>
