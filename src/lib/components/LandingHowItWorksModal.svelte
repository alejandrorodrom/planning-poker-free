<script lang="ts">
  import ModalShell from '$lib/components/ModalShell.svelte';
  import { t } from '$lib/i18n';

  type Props = {
    open: boolean;
    onclose: () => void;
  };

  let { open, onclose }: Props = $props();

  const steps = $derived([
    { title: t('landing.howStep1Title'), body: t('landing.howStep1Body') },
    { title: t('landing.howStep2Title'), body: t('landing.howStep2Body') },
    { title: t('landing.howStep3Title'), body: t('landing.howStep3Body') }
  ]);
</script>

<ModalShell
  {open}
  keepMounted
  title={t('landing.howItWorksTitle')}
  titleId="landing-how-modal-title"
  description={t('landing.howItWorksDescription')}
  size="lg"
  onclose={onclose}
>
  <ol class="how" class:how--open={open}>
    {#each steps as step, index (step.title)}
      <li class="how__item" style={`--i: ${index}`}>
        <span class="how__num" aria-hidden="true">{index + 1}</span>
        <div class="how__copy">
          <h3 class="how__title">{step.title}</h3>
          <p class="how__body">{step.body}</p>
        </div>
      </li>
    {/each}
  </ol>
</ModalShell>

<style>
  .how {
    margin: 0;
    padding: 0 0 4px;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .how__item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 0ms;
  }

  .how--open .how__item {
    opacity: 1;
    transform: translateY(0);
    transition-delay: calc(90ms + var(--i) * 70ms);
  }

  .how__num {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    background: rgba(33, 172, 195, 0.14);
    color: var(--color-brand-dark);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 800;
    transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: inherit;
  }

  .how--open .how__num {
    transform: scale(1);
  }

  .how:not(.how--open) .how__num {
    transform: scale(0.86);
  }

  .how__copy {
    min-width: 0;
  }

  .how__title {
    margin: 0 0 4px;
    font-family: var(--font-body);
    font-size: var(--text-md);
    font-weight: 700;
    color: #0b3d4a;
  }

  .how__body {
    margin: 0;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    line-height: var(--leading-snug);
    color: #4a6a72;
  }

  @media (prefers-reduced-motion: reduce) {
    .how__item,
    .how__num {
      transition: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
