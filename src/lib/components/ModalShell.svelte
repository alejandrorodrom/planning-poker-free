<script lang="ts">
  import type { Snippet } from 'svelte';

  type Size = 'sm' | 'md' | 'lg' | 'xl';
  type Variant = 'panel' | 'simple' | 'soft';

  type Props = {
    open: boolean;
    title: string;
    titleId: string;
    eyebrow?: string;
    description?: string;
    hint?: string;
    size?: Size;
    variant?: Variant;
    centered?: boolean;
    onclose: () => void;
    onescape?: () => void;
    children?: Snippet;
    headerAside?: Snippet;
    footer?: Snippet;
  };

  let {
    open,
    title,
    titleId,
    eyebrow,
    description,
    hint,
    size = 'md',
    variant = 'panel',
    centered = false,
    onclose,
    onescape,
    children,
    headerAside,
    footer
  }: Props = $props();

  function onKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === 'Escape') (onescape ?? onclose)();
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <div
    class="modal-shell__overlay"
    class:modal-shell__overlay--soft={variant === 'soft'}
  >
    <div class="modal-shell__frost" aria-hidden="true"></div>
    <button type="button" class="modal-shell__backdrop" aria-label="Cerrar" onclick={onclose}></button>
    <div
      class="modal-shell"
      class:modal-shell--panel={variant === 'panel'}
      class:modal-shell--simple={variant === 'simple'}
      class:modal-shell--soft={variant === 'soft'}
      class:modal-shell--sm={size === 'sm'}
      class:modal-shell--md={size === 'md'}
      class:modal-shell--lg={size === 'lg'}
      class:modal-shell--xl={size === 'xl'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabindex="-1"
    >
      <header
        class="modal-shell__header"
        class:modal-shell__header--centered={centered}
        class:modal-shell__header--split={Boolean(headerAside)}
      >
        <div class="modal-shell__heading">
          {#if eyebrow}
            <p class="modal-shell__eyebrow">{eyebrow}</p>
          {/if}
          <h2 id={titleId} class="modal-shell__title">{title}</h2>
          {#if description}
            <p class="modal-shell__description">{description}</p>
          {/if}
          {#if hint}
            <p class="modal-shell__hint">{hint}</p>
          {/if}
        </div>
        {#if headerAside}
          <div class="modal-shell__aside">
            {@render headerAside()}
          </div>
        {/if}
      </header>

      {#if children}
        <div class="modal-shell__body">
          {@render children()}
        </div>
      {/if}

      {#if footer}
        <footer class="modal-shell__footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-shell__overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: 24px;
    isolation: isolate;
  }

  .modal-shell__overlay--soft {
    padding: 16px;
  }

  .modal-shell__frost {
    position: absolute;
    inset: 0;
    background: rgba(8, 40, 48, 0.42);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    transform: translateZ(0);
    pointer-events: none;
  }

  .modal-shell__overlay--soft .modal-shell__frost {
    background: rgba(8, 32, 40, 0.48);
  }

  .modal-shell__backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  .modal-shell {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    max-height: min(86vh, 720px);
    overflow: hidden;
    width: min(100%, 480px);
    transform: translateZ(0);
    animation: modal-rise-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .modal-shell--sm {
    width: min(100%, 420px);
  }

  .modal-shell--md {
    width: min(100%, 480px);
  }

  .modal-shell--lg {
    width: min(100%, 560px);
  }

  .modal-shell--xl {
    width: min(100%, 44rem);
    max-height: min(92dvh, 42rem);
  }

  .modal-shell--panel {
    background:
      radial-gradient(ellipse 90% 60% at 0% 0%, rgba(33, 172, 195, 0.12), transparent 55%),
      #fff;
    border: 1px solid rgba(22, 93, 112, 0.22);
    border-radius: 22px;
    box-shadow: 0 24px 60px rgba(11, 61, 74, 0.28);
  }

  .modal-shell--simple {
    max-height: none;
    background: var(--color-surface);
    border: 2px solid black;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: 28px 24px 22px;
  }

  .modal-shell--soft {
    background: #f7fbfc;
    border: 1px solid rgba(22, 93, 112, 0.12);
    border-radius: 22px;
    box-shadow: 0 24px 60px rgba(8, 40, 48, 0.28);
  }

  .modal-shell--simple .modal-shell__header {
    padding: 0;
    border-bottom: none;
  }

  .modal-shell--simple .modal-shell__body {
    padding: 0;
    overflow: visible;
  }

  .modal-shell--simple .modal-shell__footer {
    padding: 0;
    border-top: none;
    background: transparent;
  }

  .modal-shell--simple .modal-shell__title {
    margin: 0 0 10px;
    font-family: var(--font-body);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-brand-dark);
  }

  .modal-shell--simple .modal-shell__description {
    margin: 0 0 14px;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
  }

  .modal-shell--simple:not(:has(.modal-shell__body)) .modal-shell__description {
    margin-bottom: 24px;
  }

  .modal-shell__header {
    flex-shrink: 0;
    padding: 28px 28px 20px;
    border-bottom: 1px solid rgba(22, 93, 112, 0.1);
  }

  .modal-shell__header--split {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .modal-shell__header--centered {
    text-align: center;
    padding: 18px 24px 8px;
  }

  .modal-shell--soft .modal-shell__header {
    border-bottom: none;
  }

  .modal-shell__heading {
    min-width: 0;
    flex: 1;
  }

  .modal-shell__aside {
    flex-shrink: 0;
  }

  .modal-shell__eyebrow {
    margin: 0 0 4px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-brand);
  }

  .modal-shell--soft .modal-shell__eyebrow {
    letter-spacing: 0.12em;
  }

  .modal-shell__title {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.1;
    color: #0b3d4a;
  }

  .modal-shell--soft .modal-shell__title {
    margin: 0;
    font-size: 1.85rem;
  }

  .modal-shell__description {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
    color: #4a6a72;
  }

  .modal-shell--soft .modal-shell__description {
    margin: 4px 0 0;
    font-size: 0.88rem;
  }

  .modal-shell__hint {
    margin: 12px 0 0;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--color-brand-dark);
  }

  .modal-shell__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 18px 20px;
  }

  .modal-shell--soft .modal-shell__body {
    padding: 4px 24px 12px;
  }

  .modal-shell__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding: 16px 20px 20px;
    border-top: 1px solid rgba(22, 93, 112, 0.1);
    background: rgba(255, 255, 255, 0.85);
  }

  .modal-shell--soft .modal-shell__footer {
    padding: 12px 24px 18px;
    background: #f7fbfc;
  }

  .modal-shell--simple .modal-shell__footer {
    flex-wrap: wrap;
    gap: 10px;
  }

  @keyframes modal-rise-in {
    from {
      opacity: 0;
      transform: translateZ(0) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateZ(0) translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-shell {
      animation: none;
    }

    .modal-shell__frost {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: rgba(8, 40, 48, 0.62);
    }
  }

  @media (max-width: 520px) {
    .modal-shell__header:not(.modal-shell__header--centered) {
      padding: 22px 18px 16px;
    }

    .modal-shell__body {
      padding: 14px 12px;
    }

    .modal-shell__footer {
      padding: 14px 18px 20px;
    }
  }
</style>
