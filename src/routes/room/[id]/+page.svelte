<script lang="ts">
  import { page } from '$app/state';

  const roomId = $derived(page.params.id);
  const name = $derived(page.url.searchParams.get('name') ?? 'Jugador');
  const isPrivate = $derived(page.url.searchParams.get('private') === '1');
</script>

<svelte:head>
  <title>Sala {roomId} · Planning Poker</title>
</svelte:head>

<section class="room">
  <p class="room__eyebrow">{isPrivate ? 'Sala privada' : 'Sala pública'}</p>
  <h1 class="room__title">{roomId}</h1>
  <p class="room__copy">
    Hola <strong>{name}</strong>. El realtime con Durable Objects llega en el siguiente paso. Por
    ahora puedes copiar y compartir este link:
  </p>
  <code class="room__link">/room/{roomId}</code>
</section>

<style>
  .room {
    max-width: 640px;
    margin: 48px auto;
    padding: 0 20px 48px;
    font-family: var(--font-body);
  }

  .room__eyebrow {
    margin: 0 0 8px;
    font-weight: 600;
    color: var(--color-brand);
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 0.85rem;
  }

  .room__title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 2.4rem;
    margin: 0 0 16px;
  }

  .room__copy {
    line-height: 1.6;
    margin: 0 0 20px;
  }

  .room__link {
    display: inline-block;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    background: #f3f7f8;
    border: 1px solid var(--color-brand-soft);
    font-weight: 600;
    color: var(--color-brand-dark);
  }
</style>
