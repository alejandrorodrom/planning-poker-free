<script lang="ts">
  import { MODERATOR_LABEL } from '$lib/room/roleLabel';
  import LiquidButton from './LiquidButton.svelte';
  import RoomNotice from './RoomNotice.svelte';

  type Props = {
    reason?: string;
  };

  let { reason = 'not_found' }: Props = $props();

  const copy = $derived.by(() => {
    switch (reason) {
      case 'idle':
        return {
          title: 'Sala cerrada',
          description: 'La sala se cerró por inactividad.'
        };
      case 'expired':
        return {
          title: 'Sala expirada',
          description: 'La sesión alcanzó el tiempo máximo.'
        };
      case 'host':
        return {
          title: 'Sala finalizada',
          description: `El ${MODERATOR_LABEL} finalizó la sesión.`
        };
      default:
        return {
          title: 'Sala no disponible',
          description: 'No encontramos esta sala o ya no está viva.'
        };
    }
  });
</script>

<RoomNotice title={copy.title} description={copy.description}>
  <LiquidButton text="Crear una nueva sala" href="/" />
  <a class="gone__link" href="/">Volver al inicio</a>
</RoomNotice>

<style>
  .gone__link {
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-brand);
    text-decoration: none;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .gone__link:hover {
    text-decoration: underline;
  }
</style>
