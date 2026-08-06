<script lang="ts">
  import '$lib/styles/global.css';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  let { children } = $props();
</script>

<div class="app-shell">
  <Navbar />
  <main class="app-shell__main">
    {@render children()}
  </main>
  <Footer />
</div>
