<script lang="ts">
  import { page } from '$app/state';
  import '$lib/styles/global.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  let { children } = $props();

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
