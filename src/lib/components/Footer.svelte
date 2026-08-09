<script lang="ts">
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { t } from '$lib/i18n';

  type Props = {
    compact?: boolean;
  };

  let { compact = false }: Props = $props();
</script>

<footer class="container-footer" class:container-footer--compact={compact}>
  <section class="footer">
    <p class="footer__left">
      <span class="footer__left-code" aria-hidden="true">&lt;/&gt;</span>
      {#if !compact}
        {t('footer.developedBy')}
      {/if}
      <a
        class="footer__left-author"
        href="https://www.linkedin.com/in/alejandro-rodriguez-romero"
        target="_blank"
        rel="noopener noreferrer"
      >
        Alejandro Rodriguez Romero
      </a>
    </p>
    <div class="footer__right">
      {#if !compact}
        <LanguageSwitcher compact />
      {/if}
      <a
        class="footer__right-link"
        href="https://github.com/alejandrorodrom/planning-poker-free"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        GitHub
      </a>
      <a
        class="footer__right-link footer__right-link--sponsor"
        href="https://github.com/sponsors/alejandrorodrom"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('footer.sponsorAria')}
      >
        <svg
          class="footer__sponsor-icon"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M8 14.25l-.345-.666C4.53 8.988 2.5 7.01 2.5 4.75A3.25 3.25 0 0 1 5.75 1.5c1.05 0 2.03.49 2.65 1.29A3.24 3.24 0 0 1 11.05 1.5 3.25 3.25 0 0 1 14.3 4.75c0 2.26-2.03 4.238-5.155 8.834L8 14.25z"
          />
        </svg>
        Sponsor
      </a>
    </div>
  </section>
</footer>

<style>
  .container-footer {
    display: block;
    width: 100%;
    flex-shrink: 0;
    user-select: none;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin: 15px;
    padding: 0 15px;
    font-size: var(--text-md);
    font-family: var(--font-body);
    flex-wrap: wrap;
  }

  .container-footer--compact .footer {
    margin: 6px 12px;
    padding: 0 8px;
    font-size: var(--text-xs);
    gap: 8px;
  }

  /* BP_MOBILE — sync with src/lib/breakpoints.ts */
  @media (max-width: 720px) {
    :global(.app-shell:has(.room--arena)) .container-footer--compact {
      display: none;
    }
  }

  .footer__left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
    gap: 5px;
  }

  .container-footer--compact .footer__left {
    gap: 4px;
  }

  .footer__left-code {
    margin-right: 5px;
    font-weight: 600;
    color: var(--color-brand);
  }

  .container-footer--compact .footer__left-code {
    margin-right: 2px;
  }

  .footer__left-author {
    color: black;
    font-weight: 600;
    text-decoration: none;
  }

  .footer__left-author:hover {
    text-decoration: underline;
  }

  .footer__right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .container-footer--compact .footer__right {
    gap: 10px;
  }

  .footer__right-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: black;
    text-decoration: none;
    font-weight: 600;
  }

  .footer__right-link:hover {
    color: var(--color-brand);
  }

  .footer__right-link--sponsor:hover {
    color: #bf3989;
  }

  .footer__sponsor-icon {
    flex-shrink: 0;
  }
</style>
