<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import { MODERATOR_LABEL } from '$lib/room/roleLabel';
  import type { PlayerPublic } from '$lib/room/protocol';

  type Props = {
    open: boolean;
    players: PlayerPublic[];
    meId: string | null;
    transferTargetId?: string;
    ontransfer: () => void;
    onrelinquish: () => void;
    onfinalize: () => void;
    onclose: () => void;
  };

  let {
    open,
    players,
    meId,
    transferTargetId = $bindable(''),
    ontransfer,
    onrelinquish,
    onfinalize,
    onclose
  }: Props = $props();

  const candidates = $derived(
    players.filter((p) => p.id !== meId && p.connection === 'connected')
  );
</script>

<ModalShell
  {open}
  title="Moderación"
  titleId="moderation-modal-title"
  eyebrow="Sala"
  description="Gestiona quién facilita la sesión. Ceder pasa el rol a otra persona; dejarlo lo deja libre para que alguien lo asuma."
  size="md"
  {onclose}
>
  <div class="body">
    <section class="block">
      <h3 class="block__title">Rol de {MODERATOR_LABEL}</h3>

      <label class="field">
        <span class="field__label">Ceder a alguien conectado</span>
        <div class="field__row">
          <select class="field__select" bind:value={transferTargetId}>
            <option value="">Elige persona…</option>
            {#each candidates as p (p.id)}
              <option value={p.id}>{p.name}</option>
            {/each}
          </select>
          <LiquidButton text="Ceder" onclick={ontransfer} />
        </div>
      </label>

      {#if candidates.length === 0}
        <p class="block__note">Nadie más está conectado para ceder el rol.</p>
      {/if}

      <button type="button" class="link-action" onclick={onrelinquish}>
        Dejar el rol libre
      </button>
    </section>

    <section class="danger" aria-labelledby="danger-title">
      <div class="danger__copy">
        <h3 id="danger-title" class="danger__title">Zona de cierre</h3>
        <p class="danger__text">
          Finalizar cierra la sala para todos y borra los datos de la sesión. No se puede deshacer.
        </p>
      </div>
      <button type="button" class="danger__btn" onclick={onfinalize}>Finalizar sala</button>
    </section>
  </div>

  {#snippet footer()}
    <button type="button" class="modal-ghost" onclick={onclose}>Cerrar</button>
  {/snippet}
</ModalShell>

<style>
  .body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .block {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: #f5fafb;
    border: 1px solid rgba(22, 93, 112, 0.1);
  }

  .block__title {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 800;
    color: #0b3d4a;
  }

  .block__note {
    margin: 0;
    font-size: 0.85rem;
    color: #6a848c;
  }

  .field__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .field__row :global(.field__select) {
    flex: 1;
    min-width: 160px;
    font-size: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid black;
  }

  .link-action {
    align-self: flex-start;
    border: none;
    background: transparent;
    padding: 0;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-brand);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .link-action:hover {
    color: var(--color-brand-active);
  }

  .danger {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(247, 56, 96, 0.28);
    background: linear-gradient(160deg, rgba(247, 56, 96, 0.08), #fff 55%);
  }

  .danger__title {
    margin: 0 0 6px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 800;
    color: #8b1234;
  }

  .danger__text {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.45;
    color: #6d3a48;
  }

  .danger__btn {
    align-self: stretch;
    min-height: 46px;
    padding: 0.7em 1.4em;
    border: 2px solid var(--color-error);
    border-radius: var(--radius-xl);
    background: transparent;
    color: var(--color-error);
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background 160ms ease,
      color 160ms ease;
  }

  .danger__btn:hover {
    background: var(--color-error);
    color: white;
  }
</style>
