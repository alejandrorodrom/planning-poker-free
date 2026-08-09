<script lang="ts">
  import LiquidButton from './LiquidButton.svelte';
  import ModalShell from './ModalShell.svelte';
  import { t } from '$lib/i18n';

  type Props = {
    open: boolean;
    roomName: string;
    roomLink: string;
    canNativeShare?: boolean;
    oncopy: () => boolean | Promise<boolean>;
    onshare?: () => void;
    onclose: () => void;
  };

  let {
    open,
    roomName,
    roomLink,
    canNativeShare = false,
    oncopy,
    onshare,
    onclose
  }: Props = $props();

  let copied = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (!open) {
      copied = false;
      if (resetTimer) clearTimeout(resetTimer);
    }
  });

  async function handleCopy() {
    const ok = await oncopy();
    if (!ok) return;
    copied = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<ModalShell
  {open}
  title={t('invite.title')}
  titleId="invite-modal-title"
  description={t('invite.description', { roomName })}
  size="sm"
  variant="simple"
  {onclose}
>
  <code class="modal__link">{roomLink}</code>

  {#snippet footer()}
    <LiquidButton text={t('common.close')} onclick={onclose} />
    <button
      type="button"
      class="modal__btn"
      class:modal__btn--copied={copied}
      onclick={handleCopy}
      aria-live="polite"
    >
      {#if copied}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M9.55 18.2 3.8 12.45l1.9-1.9 3.85 3.85L18.3 5.65l1.9 1.9L9.55 18.2Z"
          />
        </svg>
        {t('common.copied')}
      {:else}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
          />
        </svg>
        {t('invite.copy')}
      {/if}
    </button>
    {#if canNativeShare && onshare}
      <button type="button" class="modal__btn" onclick={onshare}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-5.91.7L8.04 9.81A3 3 0 1 0 8 14.2l7.12 4.16c.05.02.09.04.14.04A2.99 2.99 0 1 0 18 16.08Z"
          />
        </svg>
        {t('invite.send')}
      </button>
    {/if}
  {/snippet}
</ModalShell>

<style>
  .modal__link {
    display: block;
    margin-bottom: 20px;
    padding: 12px 14px;
    background: #f3f7f8;
    border-radius: var(--radius-md);
    word-break: break-all;
    font-size: 0.9rem;
  }

  .modal__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    min-width: 9.5rem;
    padding: 0.65em 1.25em;
    border: 4px solid var(--color-brand);
    border-radius: var(--radius-xl);
    background: transparent;
    color: var(--color-brand);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95em;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      color 200ms ease,
      background 200ms ease,
      border-color 200ms ease;
  }

  .modal__btn:hover {
    background: var(--color-brand);
    color: white;
  }

  .modal__btn--copied {
    border-color: var(--color-brand-dark);
    background: var(--color-brand);
    color: white;
  }

  .modal__btn--copied:hover {
    background: var(--color-brand-dark);
    border-color: var(--color-brand-dark);
  }
</style>
