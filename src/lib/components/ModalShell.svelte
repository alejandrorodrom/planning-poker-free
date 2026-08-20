<script lang="ts">
  import type { Snippet } from 'svelte';
  import { t } from '$lib/i18n';

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
    /** Keep markup in the DOM when closed (SSR/SEO). Hidden and inert until opened. */
    keepMounted?: boolean;
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
    keepMounted = false,
    onclose,
    onescape,
    children,
    headerAside,
    footer
  }: Props = $props();

  const mounted = $derived(open || keepMounted);

  function onKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === 'Escape') (onescape ?? onclose)();
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if mounted}
  <div
    class="modal-shell__overlay"
    class:modal-shell__overlay--soft={variant === 'soft'}
    class:modal-shell__overlay--closed={!open}
    class:modal-shell__overlay--animated={keepMounted}
    hidden={!open && !keepMounted}
    inert={!open}
  >
    <div class="modal-shell__frost" aria-hidden="true"></div>
    {#if open}
      <button type="button" class="modal-shell__backdrop" aria-label={t('common.close')} onclick={onclose}></button>
    {/if}
    <div
      class="modal-shell"
      class:modal-shell--panel={variant === 'panel'}
      class:modal-shell--simple={variant === 'simple'}
      class:modal-shell--soft={variant === 'soft'}
      class:modal-shell--sm={size === 'sm'}
      class:modal-shell--md={size === 'md'}
      class:modal-shell--lg={size === 'lg'}
      class:modal-shell--xl={size === 'xl'}
      class:modal-shell--enter={keepMounted && open}
      class:modal-shell--exit={keepMounted && !open}
      role="dialog"
      aria-modal={open ? 'true' : undefined}
      aria-labelledby={titleId}
      aria-hidden={!open}
      tabindex="-1"
    >
      <header
        class="modal-shell__header"
        class:modal-shell__header--centered={centered}
        class:modal-shell__header--split={Boolean(headerAside)}
      >
        <div class="modal-shell__top">
          <div class="modal-shell__heading">
            {#if eyebrow}
              <p class="modal-shell__eyebrow">{eyebrow}</p>
            {/if}
            <h2 id={titleId} class="modal-shell__title">{title}</h2>
          </div>
          {#if headerAside}
            <div class="modal-shell__aside">
              {@render headerAside()}
            </div>
          {/if}
        </div>
        {#if description}
          <p class="modal-shell__description">{description}</p>
        {/if}
        {#if hint}
          <p class="modal-shell__hint">{hint}</p>
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

  /* keepMounted closed: in DOM for SEO, invisible and non-interactive */
  .modal-shell__overlay--closed:not(.modal-shell__overlay--animated) {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    pointer-events: none;
  }

  .modal-shell__overlay--animated {
    /* visibility waits for blur/panel exit; don't fade whole overlay (kills blur) */
    transition: visibility 0s linear 320ms;
  }

  .modal-shell__overlay--animated:not(.modal-shell__overlay--closed) {
    visibility: visible;
    transition: visibility 0s linear 0s;
  }

  .modal-shell__overlay--animated.modal-shell__overlay--closed {
    visibility: hidden;
    pointer-events: none;
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

  .modal-shell__overlay--animated .modal-shell__frost {
    background: rgba(8, 40, 48, 0);
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
    transition:
      background 320ms cubic-bezier(0.22, 1, 0.36, 1),
      backdrop-filter 320ms cubic-bezier(0.22, 1, 0.36, 1),
      -webkit-backdrop-filter 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .modal-shell__overlay--animated:not(.modal-shell__overlay--closed) .modal-shell__frost {
    background: rgba(8, 40, 48, 0.42);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .modal-shell__overlay--soft:not(.modal-shell__overlay--animated) .modal-shell__frost {
    background: rgba(8, 32, 40, 0.48);
  }

  .modal-shell__overlay--animated.modal-shell__overlay--soft:not(.modal-shell__overlay--closed)
    .modal-shell__frost {
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

  .modal-shell__overlay--animated .modal-shell {
    animation: none;
    transition:
      opacity 300ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .modal-shell--enter {
    opacity: 1;
    transform: translateZ(0) translateY(0) scale(1);
  }

  .modal-shell--exit {
    opacity: 0;
    transform: translateZ(0) translateY(14px) scale(0.97);
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
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-brand-dark);
  }

  .modal-shell--simple .modal-shell__description {
    margin: 0 0 14px;
    font-size: var(--text-md);
    line-height: var(--leading-normal);
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

  .modal-shell__top {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .modal-shell__header--split .modal-shell__top {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px 16px;
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
    font-size: var(--text-xs);
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-brand);
  }

  .modal-shell--soft .modal-shell__eyebrow {
    letter-spacing: 0.12em;
  }

  .modal-shell__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--text-display-sm);
    font-weight: 400;
    line-height: var(--leading-tight);
    color: #0b3d4a;
  }

  .modal-shell--soft .modal-shell__title {
    font-size: var(--text-display-sm);
  }

  .modal-shell__description {
    margin: 10px 0 0;
    font-size: var(--text-md);
    line-height: var(--leading-snug);
    color: #4a6a72;
  }

  .modal-shell--soft .modal-shell__description {
    margin: 4px 0 0;
    font-size: var(--text-sm);
  }

  .modal-shell__hint {
    margin: 12px 0 0;
    font-size: var(--text-sm);
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

    .modal-shell__overlay--animated,
    .modal-shell__overlay--animated .modal-shell__frost,
    .modal-shell__overlay--animated .modal-shell {
      transition: none;
    }

    .modal-shell__overlay--animated.modal-shell__overlay--closed .modal-shell__frost,
    .modal-shell__overlay--animated .modal-shell__frost {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    .modal-shell__overlay--animated:not(.modal-shell__overlay--closed) .modal-shell__frost {
      background: rgba(8, 40, 48, 0.62);
    }

    .modal-shell__frost {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: rgba(8, 40, 48, 0.62);
    }
  }

  /* BP_MOBILE — sync with src/lib/breakpoints.ts */
  @media (max-width: 720px) {
    .modal-shell__overlay {
      padding: 16px 12px;
      align-items: end;
      justify-items: center;
    }

    .modal-shell__overlay--soft {
      padding: 12px;
    }

    .modal-shell {
      width: 100%;
      height: auto;
      max-height: min(88dvh, 720px);
      border-radius: 22px 22px 14px 14px;
      align-self: end;
      justify-self: stretch;
    }

    .modal-shell--lg,
    .modal-shell--xl,
    .modal-shell--md,
    .modal-shell--sm {
      width: 100%;
      height: auto;
    }

    /* Confirm / compact: float centered and hug content */
    .modal-shell__overlay:has(.modal-shell--simple) {
      align-items: center;
      justify-items: center;
      padding: 16px;
    }

    .modal-shell--simple,
    .modal-shell--simple.modal-shell--sm {
      width: min(100%, 400px);
      max-height: none;
      height: auto;
      align-self: center;
      border-radius: 18px;
      padding: 22px 18px 18px;
    }

    .modal-shell--simple .modal-shell__header:not(.modal-shell__header--centered) {
      padding: 0;
    }

    .modal-shell--simple .modal-shell__title {
      font-size: var(--text-lg);
    }

    .modal-shell--simple .modal-shell__description {
      margin-bottom: 18px;
    }

    .modal-shell--simple .modal-shell__footer {
      padding: 0;
      justify-content: flex-end;
      gap: 8px;
    }

    .modal-shell__header:not(.modal-shell__header--centered) {
      padding: 18px 16px 12px;
    }

    .modal-shell__header--split .modal-shell__top {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }

    .modal-shell__aside {
      width: 100%;
    }

    .modal-shell__title {
      font-size: var(--text-display);
    }

    .modal-shell__description {
      margin-top: 8px;
    }

    .modal-shell__body {
      flex: 0 1 auto;
      padding: 4px 16px 18px;
    }

    .modal-shell__footer {
      padding: 12px 16px 16px;
    }

    .modal-shell__footer :global(.button) {
      font-size: var(--text-xs);
      padding: 0.4em 1em;
      border-width: 2px;
      min-height: 40px;
    }

    /* Animated landing modals: slide up from bottom */
    .modal-shell__overlay--animated .modal-shell--exit {
      transform: translateZ(0) translateY(18px) scale(1);
    }

    .modal-shell__overlay--animated .modal-shell--enter {
      transform: translateZ(0) translateY(0) scale(1);
    }
  }
</style>
