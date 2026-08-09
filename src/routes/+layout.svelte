<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import '$lib/styles/global.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { initLocale, syncLocaleFromBrowser } from '$lib/i18n';

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
</script>

<div class="app-shell">
  {#if !hideNavbar}
    <Navbar />
  {/if}
  <main class="app-shell__main">
    {@render children()}
  </main>
  <Footer />
</div>
