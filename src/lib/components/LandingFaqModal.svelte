<script lang="ts">
  import ModalShell from '$lib/components/ModalShell.svelte';
  import { landingFaqItems } from '$lib/seo/landing-faq';
  import { getMessages, t } from '$lib/i18n';

  type Props = {
    open: boolean;
    onclose: () => void;
  };

  let { open, onclose }: Props = $props();

  const faqs = $derived(landingFaqItems(getMessages().landing));
  let openIndex = $state<number | null>(0);

  $effect(() => {
    if (open) openIndex = 0;
  });

  function toggle(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<ModalShell
  {open}
  keepMounted
  title={t('landing.faqTitle')}
  titleId="landing-faq-modal-title"
  description={t('landing.faqDescription')}
  size="lg"
  onclose={onclose}
>
  <div class="faq">
    {#each faqs as item, index (item.question)}
      {@const expanded = openIndex === index}
      <div class="faq__item">
        <button
          type="button"
          class="faq__q"
          class:faq__q--open={expanded}
          aria-expanded={expanded}
          aria-controls="landing-faq-panel-{index}"
          id="landing-faq-trigger-{index}"
          onclick={() => toggle(index)}
        >
          <span class="faq__q-text">{item.question}</span>
          <span class="faq__icon" aria-hidden="true"></span>
        </button>
        <div
          id="landing-faq-panel-{index}"
          class="faq__panel"
          class:faq__panel--open={expanded}
          role="region"
          aria-labelledby="landing-faq-trigger-{index}"
        >
          <div class="faq__panel-inner">
            <p class="faq__a">{item.answer}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>
</ModalShell>

<style>
  .faq {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .faq__item {
    border-bottom: 1px solid rgba(22, 93, 112, 0.12);
  }

  .faq__item:last-child {
    border-bottom: none;
  }

  .faq__q {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    border: 0;
    padding: 12px 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-body);
    font-size: var(--text-md);
    font-weight: 700;
    color: #0b3d4a;
  }

  .faq__q-text {
    min-width: 0;
    flex: 1;
  }

  .faq__icon {
    position: relative;
    flex-shrink: 0;
    width: 1.1rem;
    height: 1.1rem;
    margin-top: 0.15rem;
  }

  .faq__icon::before,
  .faq__icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    background: var(--color-brand);
    border-radius: 1px;
    transition:
      transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 200ms ease;
  }

  .faq__icon::before {
    width: 12px;
    height: 2px;
    transform: translate(-50%, -50%);
  }

  .faq__icon::after {
    width: 2px;
    height: 12px;
    transform: translate(-50%, -50%);
  }

  .faq__q--open .faq__icon::after {
    transform: translate(-50%, -50%) rotate(90deg);
    opacity: 0;
  }

  .faq__panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .faq__panel--open {
    grid-template-rows: 1fr;
  }

  .faq__panel-inner {
    overflow: hidden;
    min-height: 0;
  }

  .faq__a {
    margin: 0 0 14px;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
    color: #4a6a72;
    opacity: 0;
    transform: translateY(-4px);
    transition:
      opacity 220ms ease 40ms,
      transform 280ms cubic-bezier(0.22, 1, 0.36, 1) 40ms;
  }

  .faq__panel--open .faq__a {
    opacity: 1;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .faq__panel,
    .faq__a,
    .faq__icon::before,
    .faq__icon::after {
      transition: none;
    }
  }
</style>
