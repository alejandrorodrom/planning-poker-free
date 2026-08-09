<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import StoryStatusChip from '$lib/components/StoryStatusChip.svelte';
  import { t } from '$lib/i18n';
  import { downloadResultsImage } from '$lib/room/resultsImage';
  import { formatEstimateLabel, isPointEstimate } from '$lib/room/decks';
  import type { StoryPublic } from '$lib/room/protocol';

  type Props = {
    open: boolean;
    roomName: string;
    stories: StoryPublic[];
    oncopyMd: () => void;
    oncopyCsv: () => void;
    onclose: () => void;
    onflash?: (message: string) => void;
    onerror?: (message: string) => void;
  };

  let {
    open,
    roomName,
    stories,
    oncopyMd,
    oncopyCsv,
    onclose,
    onflash,
    onerror
  }: Props = $props();

  let capturing = $state(false);

  const estimatedCount = $derived(stories.filter((s) => s.estimates.overall).length);
  const description = $derived(
    stories.length === 0
      ? t('results.emptyDesc')
      : t('results.progressDesc', { estimated: estimatedCount, total: stories.length })
  );

  async function captureImage() {
    if (capturing) return;
    capturing = true;
    try {
      await downloadResultsImage(roomName, stories);
      onflash?.(t('results.imageDownloaded'));
    } catch {
      onerror?.(t('results.captureFailed'));
    } finally {
      capturing = false;
    }
  }
</script>

<ModalShell
  {open}
  title={t('results.title')}
  titleId="results-modal-title"
  eyebrow={t('moderation.eyebrow')}
  {description}
  size="lg"
  {onclose}
>
  {#snippet headerAside()}
    <div class="exports">
      <button
        type="button"
        class="export-btn export-btn--photo"
        onclick={captureImage}
        disabled={capturing}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Zm8-9.7h-2.2l-1.4-1.8A2 2 0 0 0 14.8 3H9.2a2 2 0 0 0-1.6.7L6.2 5.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
          />
        </svg>
        {capturing ? '…' : t('results.photo')}
      </button>
      <button type="button" class="export-btn" onclick={oncopyMd}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
          />
        </svg>
        MD
      </button>
      <button type="button" class="export-btn" onclick={oncopyCsv}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
          />
        </svg>
        CSV
      </button>
    </div>
  {/snippet}

  {#if stories.length === 0}
    <div class="empty">
      <span class="empty__mark" aria-hidden="true">∅</span>
      <p>{t('results.emptyBody')}</p>
    </div>
  {:else}
    <ul class="results">
      {#each stories as story (story.id)}
        <li class="results__item" class:results__item--done={Boolean(story.estimates.overall)}>
          <div class="results__main">
            <span class="results__title">{story.title}</span>
            {#if story.estimates.byTeam?.length}
              <span class="results__teams">
                {story.estimates.byTeam
                  .map((teamEst) => `${teamEst.teamName}: ${formatEstimateLabel(teamEst.value)}`)
                  .join(' · ')}
              </span>
            {/if}
          </div>
          <div class="results__meta">
            <span class="results__value" class:results__value--empty={!story.estimates.overall}>
              {story.estimates.overall ?? '—'}{#if isPointEstimate(story.estimates.overall)}<span
                  class="results__unit">{t('decks.pointsSuffix')}</span
                >{/if}
            </span>
            <StoryStatusChip status={story.status} tone="results" />
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#snippet footer()}
    <LiquidButton text={t('common.close')} onclick={onclose} />
  {/snippet}
</ModalShell>

<style>
  .exports {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .export-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px;
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.85);
    color: var(--color-brand);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition:
      background 160ms ease,
      color 160ms ease;
  }

  .export-btn:hover:not(:disabled) {
    background: var(--color-brand);
    color: white;
  }

  .export-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .export-btn--photo {
    background: var(--color-brand);
    color: white;
  }

  .export-btn--photo:hover:not(:disabled) {
    background: var(--color-brand-dark);
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 40px 28px;
    text-align: center;
    color: #4a6a72;
  }

  .empty__mark {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #eef4f6;
    color: var(--color-brand);
    font-size: 1.2rem;
    font-weight: 700;
  }

  .empty p {
    margin: 0;
    max-width: 28ch;
    line-height: 1.45;
  }

  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .results__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f5fafb;
    border: 1px solid rgba(22, 93, 112, 0.1);
    transition: background 160ms ease;
  }

  .results__item:hover {
    background: #eef6f8;
  }

  .results__item--done {
    background: linear-gradient(135deg, rgba(54, 168, 72, 0.08), rgba(33, 172, 195, 0.06));
    border-color: rgba(54, 168, 72, 0.22);
  }

  .results__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .results__title {
    font-weight: 700;
    font-size: 1rem;
    color: #123;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .results__teams {
    font-size: 0.78rem;
    font-weight: 600;
    color: #5a7a82;
  }

  .results__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .results__value {
    min-width: 2.4rem;
    text-align: center;
    font-family: var(--font-display);
    font-size: 1.7rem;
    font-weight: 400;
    line-height: 1;
    color: var(--color-brand-dark);
  }

  .results__unit {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: #3d6a74;
  }

  .results__value--empty {
    color: #9ab0b6;
    font-size: 1.35rem;
  }

  @media (max-width: 520px) {
    .results__item {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
