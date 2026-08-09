<script lang="ts">
  import { i18n, setLocale, t, type Locale } from '$lib/i18n';

  type Props = {
    compact?: boolean;
  };

  let { compact = false }: Props = $props();

  const options: { value: Locale; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'es', label: 'ES' }
  ];

  function select(next: Locale) {
    setLocale(next);
  }
</script>

<div class="lang-switch" class:lang-switch--compact={compact} role="group" aria-label={t('common.language')}>
  {#each options as option, index (option.value)}
    {#if index > 0}
      <span class="lang-switch__sep" aria-hidden="true">|</span>
    {/if}
    <button
      type="button"
      class="lang-switch__btn"
      class:lang-switch__btn--active={i18n.locale === option.value}
      aria-current={i18n.locale === option.value ? 'true' : undefined}
      onclick={() => select(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .lang-switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .lang-switch--compact {
    font-size: var(--text-xs);
  }

  .lang-switch__sep {
    color: #9aa8ad;
    user-select: none;
  }

  .lang-switch__btn {
    border: none;
    background: transparent;
    color: #5f7178;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    font: inherit;
  }

  .lang-switch__btn:hover {
    color: var(--color-brand);
  }

  .lang-switch__btn--active {
    color: var(--color-brand);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
