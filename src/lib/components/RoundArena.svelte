<script lang="ts">
  import { untrack } from 'svelte';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import { t } from '$lib/i18n';
  import type { ActiveRoundPublic, EstimateRule, PlayerPublic, StoryPublic, Team } from '$lib/room/protocol';
  import { isInAudience } from '$lib/room/audience';
  import { sanitizeRoleLabel } from '$lib/room/roleLabel';
  import { formatEstimateLabel, isPointEstimate } from '$lib/room/decks';

  type DeckCard = { value: string; special?: boolean };

  type TimerPreset = { id: string; labelKey?: string; label?: string; seconds: number | null };

  const TIMER_PRESETS: TimerPreset[] = [
    { id: 'off', labelKey: 'arena.timerOff', seconds: null },
    { id: '30', label: '30s', seconds: 30 },
    { id: '60', label: '1m', seconds: 60 },
    { id: '120', label: '2m', seconds: 120 }
  ];

  type Props = {
    players: PlayerPublic[];
    teams: Team[];
    meId: string | null;
    round: ActiveRoundPublic | null;
    story: StoryPublic | null;
    deckCards: DeckCard[];
    eligibleToVote: boolean;
    voteStatusMessage: string | null;
    timerLabel: string | null;
    timerProgress: number | null;
    timerUrgent: boolean;
    isSm: boolean;
    estimateRule: EstimateRule;
    closeEstimate?: string;
    audienceMode?: 'all' | 'teams';
    audienceTeamIds?: string[];
    useRoundTimer?: boolean;
    timerSeconds?: number;
    onvote: (value: string) => void;
    onopenStories?: () => void;
    ontoggleTeam?: (teamId: string) => void;
    onstart?: () => void;
    onreveal?: () => void;
    oncloseVoting?: () => void;
    onrevote?: () => void;
    oncancel?: () => void;
  };

  let {
    players,
    teams,
    meId,
    round,
    story,
    deckCards,
    eligibleToVote,
    voteStatusMessage,
    timerLabel,
    timerProgress,
    timerUrgent,
    isSm,
    estimateRule,
    closeEstimate = $bindable(''),
    audienceMode = $bindable<'all' | 'teams'>('all'),
    audienceTeamIds = $bindable<string[]>([]),
    useRoundTimer = $bindable(true),
    timerSeconds = $bindable(60),
    onvote,
    onopenStories,
    ontoggleTeam,
    onstart,
    onreveal,
    oncloseVoting,
    onrevote,
    oncancel
  }: Props = $props();

  const myVote = $derived(meId && round ? round.votes[meId] : null);
  const votes = $derived(round?.votes ?? {});
  const revealed = $derived(Boolean(round?.revealed));
  const timerDone = $derived(
    Boolean(timerLabel) && (timerProgress === 0 || timerLabel === '0:00')
  );

  const isConsensus = $derived(estimateRule === 'consensus');
  const storyEstimated = $derived(
    Boolean(!round && story && (story.status === 'estimated' || story.estimates.overall))
  );
  const savedEstimate = $derived(story?.estimates.overall ?? null);
  const savedByTeam = $derived(story?.estimates.byTeam ?? []);
  const resultLabel = $derived.by(() => {
    switch (estimateRule) {
      case 'consensus':
        return t('arena.agreed');
      case 'mode':
        return t('landing.mode');
      case 'median':
        return t('landing.median');
      case 'mean':
        return t('landing.mean');
      default:
        return t('arena.estimate');
    }
  });
  const resultValue = $derived.by(() => {
    if (!round) return savedEstimate ?? '—';
    if (!round.revealed) return '—';
    if (isConsensus) return closeEstimate || (isSm ? t('arena.choose') : t('arena.pending'));
    return round.suggestedEstimate ?? '—';
  });
  const resultPending = $derived(Boolean(round?.revealed && isConsensus && !closeEstimate));

  const focusEyebrow = $derived.by(() => {
    if (!round) {
      if (storyEstimated) return t('arena.estimated');
      if (story) return t('arena.waiting');
      return t('arena.noStory');
    }
    if (revealed) return t('arena.revealedRound', { n: round.roundNumber });
    if (timerDone) return t('arena.timeUpRound', { n: round.roundNumber });
    return t('arena.votingRound', { n: round.roundNumber });
  });

  const focusTitle = $derived(
    story?.title ?? (round ? t('arena.storyFallback') : t('arena.readyToEstimate'))
  );
  const canChangeStory = $derived(!round && isSm);

  function teamName(teamId: string | null | undefined): string | null {
    if (!teamId) return null;
    return teams.find((team) => team.id === teamId)?.name ?? null;
  }

  function isWatchingSeat(player: PlayerPublic): boolean {
    if (!round) return false;
    if (player.role === 'observer') return true;
    return !isInAudience(player, round.audience);
  }

  function seatState(
    player: PlayerPublic,
    vote: string | null | 'hidden' | undefined
  ): 'empty' | 'hidden' | 'shown' | 'idle' | 'watching' {
    if (!round) return 'idle';
    if (isWatchingSeat(player)) return 'watching';
    if (vote == null || vote === undefined) return 'empty';
    if (vote === 'hidden') return 'hidden';
    return 'shown';
  }

  const activeTimerId = $derived.by(() => {
    if (!useRoundTimer) return 'off';
    if (timerSeconds === 30) return '30';
    if (timerSeconds === 120) return '120';
    return '60';
  });

  function selectTimer(seconds: number | null) {
    if (seconds == null) {
      useRoundTimer = false;
      return;
    }
    useRoundTimer = true;
    timerSeconds = seconds;
  }

  const ringDash = 283;
  const ringOffset = $derived(
    timerProgress == null ? 0 : ringDash * (1 - Math.min(1, Math.max(0, timerProgress)))
  );

  const DEAL_FLIP_DELAY_MS = 560;
  const DEAL_FLIP_MS = 400;
  const DEAL_STAGGER_MS = 32;

  const handDealKey = $derived(
    eligibleToVote && round ? `${round.storyId}:${round.roundNumber}:${round.startedAt}` : ''
  );

  let readyDealKey = $state('');
  let pickPulse = $state<string | null>(null);
  let pendingVote = $state<string | null>(null);
  let arenaSettled = $state(false);
  const handReady = $derived(Boolean(handDealKey) && readyDealKey === handDealKey);

  $effect(() => {
    const key = handDealKey;
    if (!key) {
      readyDealKey = '';
      pickPulse = null;
      pendingVote = null;
      return;
    }

    // Solo reaccionar al deal key; no reiniciar la mano por re-renders del tablero/modales.
    if (readyDealKey === key) return;

    pickPulse = null;
    pendingVote = null;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      readyDealKey = key;
      return;
    }

    const n = untrack(() => Math.max(1, deckCards.length));
    const doneAt = DEAL_FLIP_DELAY_MS + (n - 1) * DEAL_STAGGER_MS + DEAL_FLIP_MS + 60;
    const timeout = setTimeout(() => {
      readyDealKey = key;
    }, doneAt);
    return () => clearTimeout(timeout);
  });

  $effect(() => {
    if (pendingVote && myVote === pendingVote) {
      pendingVote = null;
    }
  });

  $effect(() => {
    const vote = pickPulse;
    if (!vote) return;
    const timeout = setTimeout(() => {
      if (pickPulse === vote) pickPulse = null;
    }, 460);
    return () => clearTimeout(timeout);
  });
</script>

<div
  class="arena"
  class:arena--settled={arenaSettled}
  class:arena--idle={!round && !storyEstimated}
  class:arena--estimated={!round && storyEstimated}
  class:arena--revealed={revealed}
  class:arena--urgent={timerUrgent && !!round && !revealed}
  class:arena--timeup={timerDone && !!round && !revealed}
  onanimationend={(event) => {
    if (event.target === event.currentTarget && event.animationName === 'arena-in') {
      arenaSettled = true;
    }
  }}
>
  <div class="arena__glow" aria-hidden="true"></div>

  <div class="arena__stage">
    <header class="focus">
      <div class="focus__copy">
        <p class="focus__eyebrow">{focusEyebrow}</p>
        <h2 class="focus__title">{focusTitle}</h2>
        {#if canChangeStory}
          <button type="button" class="story-change" onclick={() => onopenStories?.()}>
            {story ? t('arena.changeStory') : t('arena.chooseStory')}
          </button>
        {/if}
        {#if !round && storyEstimated && savedByTeam.length}
          <p class="focus__teams">
            {savedByTeam.map((t) => `${t.teamName}: ${formatEstimateLabel(t.value)}`).join(' · ')}
          </p>
        {/if}
      </div>

      {#if round && timerLabel && !revealed}
        <div
          class="timer"
          class:timer--urgent={timerUrgent}
          class:timer--done={timerDone}
          role="timer"
          aria-live="polite"
          aria-label={timerDone ? t('arena.timeUp') : t('arena.timeLeft', { time: timerLabel })}
        >
          <svg class="timer__ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="timer__track" cx="50" cy="50" r="45" />
            {#if !timerDone}
              <circle
                class="timer__progress"
                cx="50"
                cy="50"
                r="45"
                style={`stroke-dashoffset: ${ringOffset}`}
              />
            {/if}
          </svg>
          <span class="timer__value">{timerDone ? t('arena.timesUpShort') : timerLabel}</span>
        </div>
      {/if}

      {#if revealed || storyEstimated}
        <div
          class="reveal-badge"
          class:reveal-badge--pending={resultPending}
          class:reveal-badge--auto={!isConsensus || storyEstimated}
          class:reveal-badge--saved={storyEstimated}
          aria-live="polite"
        >
          <span class="reveal-badge__label">{storyEstimated ? t('arena.estimate') : resultLabel}</span>
          <strong class="reveal-badge__value">
            {resultValue}{#if isPointEstimate(resultValue)}<span class="reveal-badge__unit">{t('decks.pointsSuffix')}</span
              >{/if}
          </strong>
        </div>
      {/if}
    </header>

    <ul class="arena__seats" class:arena__seats--revealed={revealed}>
      {#each players as player, i (player.id)}
        {@const vote = votes[player.id]}
        {@const state = seatState(player, vote)}
        {@const isMe = player.id === meId}
        {@const online = player.connection === 'connected'}
        {@const team = teamName(player.teamId)}
        {@const tag = sanitizeRoleLabel(player.roleLabel)}
        {@const roleText = player.isScrumMaster ? t('roles.moderator') : tag}
        {@const watchLabel = roleText || t('roles.spectator')}
        <li
          class="seat"
          class:seat--me={isMe}
          class:seat--off={!online}
          class:seat--voted={state === 'hidden' || state === 'shown'}
          class:seat--shown={state === 'shown'}
          class:seat--watching={state === 'watching'}
          style={`--i: ${i}`}
        >
          {#if state === 'idle'}
            <div class="seat__figure" aria-hidden="true">
              <PlayerAvatar avatar={player.avatar} size={72} />
            </div>
          {:else if state === 'watching'}
            <div class="seat__watch" title={watchLabel} aria-label={watchLabel}>
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 5c-5.2 0-9.5 3.4-11 7 1.5 3.6 5.8 7 11 7s9.5-3.4 11-7c-1.5-3.6-5.8-7-11-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Zm0-2.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z"
                />
              </svg>
            </div>
          {:else}
            <div class="seat__card" data-state={state}>
              {#if state === 'shown'}
                <span class="seat__value">{vote}</span>
              {:else if state === 'hidden'}
                <span class="seat__back" aria-hidden="true"></span>
              {:else}
                <span class="seat__empty" aria-hidden="true">…</span>
              {/if}
            </div>
          {/if}
          <div class="seat__who" class:seat__who--figure={state === 'idle'}>
            {#if state !== 'idle'}
              <span class="seat__avatar" aria-hidden="true">
                <PlayerAvatar avatar={player.avatar} size={34} />
              </span>
            {/if}
            <span class="seat__name">
              {player.name}
              {#if isMe}<em>{t('arena.me')}</em>{/if}
            </span>
            {#if roleText || team || state === 'watching'}
              <span class="seat__meta">
                {#if roleText}
                  {roleText}
                {:else if state === 'watching'}
                  {t('roles.spectator')}
                {/if}
                {#if (roleText || state === 'watching') && team} · {/if}
                {#if team}{team}{/if}
              </span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>

    <div class="arena__hand-wrap">
      {#snippet smRevealActions()}
        <div class="arena__actions">
          <LiquidButton text={t('arena.reveal')} onclick={() => onreveal?.()} />
        </div>
        <button type="button" class="arena__cancel" onclick={() => oncancel?.()}>
          {t('room.cancelVoting')}
        </button>
      {/snippet}

      {#snippet roundSetup(cta: string)}
        <div class="setup">
          {#if teams.length > 0}
            <div class="setup__block" role="group" aria-label={t('arena.whoVotes')}>
              <p class="setup__label">{t('arena.whoVotes')}</p>
              <div class="setup__chips">
                <button
                  type="button"
                  class="setup__chip"
                  class:setup__chip--on={audienceMode === 'all'}
                  onclick={() => (audienceMode = 'all')}
                >
                  {t('arena.wholeTeam')}
                </button>
                <button
                  type="button"
                  class="setup__chip"
                  class:setup__chip--on={audienceMode === 'teams'}
                  onclick={() => (audienceMode = 'teams')}
                >
                  {t('arena.someTeams')}
                </button>
              </div>
              {#if audienceMode === 'teams'}
                <div class="setup__chips setup__chips--teams">
                  {#each teams as team (team.id)}
                    <button
                      type="button"
                      class="setup__chip setup__chip--team"
                      class:setup__chip--on={audienceTeamIds.includes(team.id)}
                      onclick={() => ontoggleTeam?.(team.id)}
                    >
                      {team.name}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
          <div class="setup__block" role="group" aria-label={t('arena.timer')}>
            <p class="setup__label">{t('arena.timer')}</p>
            <div class="setup__chips">
              {#each TIMER_PRESETS as preset (preset.id)}
                <button
                  type="button"
                  class="setup__chip"
                  class:setup__chip--on={activeTimerId === preset.id}
                  onclick={() => selectTimer(preset.seconds)}
                >
                  {preset.labelKey ? t(preset.labelKey) : preset.label}
                </button>
              {/each}
            </div>
          </div>
          <div class="arena__actions">
            <LiquidButton text={cta} onclick={() => onstart?.()} />
          </div>
        </div>
      {/snippet}

      {#if !round}
        {#if storyEstimated}
          <p class="arena__observe">
            {savedEstimate
              ? t('arena.estimateSavedWith', { value: formatEstimateLabel(savedEstimate) })
              : t('arena.estimateSaved')}
          </p>
          {#if isSm}
            {@render roundSetup(t('arena.revote'))}
          {:else}
            <p class="arena__observe arena__observe--soft">
              {t('arena.moderatorCanRevote')}
            </p>
          {/if}
        {:else if isSm}
          {#if story}
            {@render roundSetup(t('arena.startVoting'))}
          {:else}
            <p class="arena__observe">{t('arena.pickStoryFirst')}</p>
            <div class="arena__actions">
              <LiquidButton text={t('arena.viewStories')} onclick={() => onopenStories?.()} />
            </div>
          {/if}
        {:else}
          <p class="arena__observe">
            {t('arena.waitingModeratorStart')}
          </p>
        {/if}
      {:else if eligibleToVote}
        <p class="arena__hand-hint" class:arena__hand-hint--ready={handReady}>
          {t('arena.yourHand')}
        </p>
        {#key handDealKey}
          <div
            class="hand"
            class:hand--ready={handReady}
            role="group"
            aria-label={t('arena.cardsToVote')}
            aria-busy={!handReady}
          >
            {#each deckCards as card, i (card.value)}
              <button
                type="button"
                class="hand__card"
                class:hand__card--selected={handReady &&
                  (myVote === card.value || pendingVote === card.value)}
                class:hand__card--pick={pickPulse === card.value}
                class:hand__card--special={card.special}
                style={`--hi: ${i}; --hn: ${deckCards.length}; --mid: ${(deckCards.length - 1) / 2}`}
                disabled={!handReady}
                onclick={() => {
                  pendingVote = card.value;
                  pickPulse = card.value;
                  onvote(card.value);
                }}
              >
                <span class="hand__card-motion">
                  <span class="hand__card-inner">
                    <span class="hand__card-back" aria-hidden="true"></span>
                    <span class="hand__card-face">
                      <span class="hand__card-value">{card.value}</span>
                    </span>
                  </span>
                </span>
              </button>
            {/each}
          </div>
        {/key}
        {#if isSm}
          {@render smRevealActions()}
        {/if}
      {:else if revealed}
        {#if isSm}
          {#if isConsensus}
            <label class="arena__estimate">
              <span class="arena__estimate-label">{t('arena.agreedEstimate')}</span>
              <select class="arena__estimate-select" bind:value={closeEstimate}>
                <option value="">{t('arena.agreedPlaceholder')}</option>
                {#each deckCards as card (card.value)}
                  {#if !card.special}
                    <option value={card.value}>{card.value}</option>
                  {/if}
                {/each}
              </select>
            </label>
          {:else}
            <p class="arena__observe">
              {resultLabel}: <strong>{formatEstimateLabel(round.suggestedEstimate)}</strong>
            </p>
          {/if}
          <div class="arena__actions">
            <LiquidButton text={t('common.close')} onclick={() => oncloseVoting?.()} />
            <LiquidButton text={t('arena.again')} onclick={() => onrevote?.()} />
          </div>
        {:else}
          <p class="arena__observe">{t('arena.waitingModeratorClose')}</p>
        {/if}
      {:else if timerDone}
        {#if isSm}
          <p class="arena__observe arena__observe--pulse">
            {t('arena.timeOutReveal')}
          </p>
          {@render smRevealActions()}
        {:else}
          <p class="arena__observe arena__observe--pulse">
            {t('arena.timeUpWaitingReveal')}
          </p>
        {/if}
      {:else if voteStatusMessage}
        <p class="arena__observe">{voteStatusMessage}</p>
        {#if isSm}
          {@render smRevealActions()}
        {/if}
      {:else if isSm}
        {@render smRevealActions()}
      {/if}
    </div>
  </div>
</div>

<style>
  .arena {
    position: relative;
    margin: 0;
    padding: 22px 16px 88px;
    border-radius: 28px;
    overflow: hidden;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(33, 172, 195, 0.2), transparent 65%),
      linear-gradient(165deg, #e8f4f6 0%, #d4ebf0 50%, #c5e3ea 100%);
    flex: 1;
    min-height: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transform: translateZ(0);
    contain: paint;
    animation: arena-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: background 320ms ease;
  }

  .arena--settled {
    animation: none;
  }

  .arena--idle {
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, rgba(33, 172, 195, 0.14), transparent 65%),
      linear-gradient(165deg, #f2f8fa 0%, #e4f0f3 55%, #d7e8ee 100%);
  }

  .arena--estimated,
  .arena--revealed {
    background:
      radial-gradient(ellipse 80% 55% at 50% 15%, rgba(54, 168, 72, 0.18), transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(33, 172, 195, 0.16), transparent 55%),
      linear-gradient(165deg, #eef8f0 0%, #e2f2f4 55%, #d5eaf0 100%);
  }

  .arena--timeup {
    background:
      radial-gradient(ellipse 70% 50% at 50% 10%, rgba(255, 153, 0, 0.22), transparent 60%),
      linear-gradient(165deg, #fff6e8 0%, #e8f0f2 55%, #d5e6ec 100%);
  }

  .arena__glow {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 25%, rgba(80, 177, 194, 0.16), transparent 42%),
      radial-gradient(circle at 82% 70%, rgba(22, 93, 112, 0.1), transparent 45%);
  }

  .arena--revealed .arena__glow {
    animation: glow-burst 700ms ease-out both;
  }

  .arena__stage {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 28px;
    min-width: 0;
    flex: 1;
    min-height: 0;
    justify-content: center;
    overflow: auto;
  }

  .focus {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 18px 28px;
    text-align: center;
  }

  .focus__copy {
    max-width: 36rem;
  }

  .focus__eyebrow {
    margin: 0 0 6px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-brand);
  }

  .arena--timeup .focus__eyebrow {
    color: #c77800;
  }

  .arena--revealed .focus__eyebrow,
  .arena--estimated .focus__eyebrow {
    color: #1f7a2d;
  }

  .focus__title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.8rem, 4.5vw, 2.6rem);
    line-height: 1.1;
    color: #0b3d4a;
    text-wrap: balance;
  }

  .story-change {
    margin: 8px 0 0;
    padding: 0;
    border: 0;
    background: none;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-brand);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .story-change:hover {
    color: var(--color-brand-hover);
  }

  .story-change:focus-visible {
    outline: 2px solid var(--color-brand-accent);
    outline-offset: 3px;
    border-radius: 4px;
  }

  .focus__teams {
    margin: 8px 0 0;
    font-size: 0.85rem;
    font-weight: 700;
    color: #4a6a72;
    line-height: 1.35;
  }

  .timer {
    position: relative;
    width: 96px;
    height: 96px;
    flex-shrink: 0;
  }

  .timer--done {
    animation: timer-pop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .timer__ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .timer__track,
  .timer__progress {
    fill: none;
    stroke-width: 7;
  }

  .timer__track {
    stroke: rgba(22, 93, 112, 0.15);
  }

  .timer__progress {
    stroke: var(--color-brand-accent);
    stroke-linecap: round;
    stroke-dasharray: 283;
    transition: stroke-dashoffset 250ms linear;
  }

  .timer--urgent .timer__progress {
    stroke: var(--color-alert);
  }

  .timer--done .timer__track {
    stroke: rgba(255, 153, 0, 0.35);
  }

  .timer__value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-family: var(--font-display);
    font-size: 1.45rem;
    color: var(--color-brand-dark);
  }

  .timer--done .timer__value {
    font-size: 1.7rem;
    color: #c77800;
  }

  .reveal-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 110px;
    padding: 12px 18px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(54, 168, 72, 0.45);
    box-shadow: 0 10px 28px rgba(31, 122, 45, 0.12);
    animation: badge-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .reveal-badge--auto {
    border-color: rgba(33, 172, 195, 0.5);
    box-shadow: 0 10px 28px rgba(22, 93, 112, 0.12);
  }

  .reveal-badge--pending {
    border-color: rgba(22, 93, 112, 0.28);
    border-style: dashed;
  }

  .reveal-badge__label {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #1f7a2d;
  }

  .reveal-badge--auto .reveal-badge__label {
    color: var(--color-brand);
  }

  .reveal-badge--saved {
    border-color: rgba(54, 168, 72, 0.55);
  }

  .reveal-badge--saved .reveal-badge__label {
    color: #1f7a2d;
  }

  .reveal-badge--pending .reveal-badge__label {
    color: #4a6a72;
  }

  .reveal-badge__value {
    font-family: var(--font-display);
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1;
    color: #0b5d70;
  }

  .reveal-badge__unit {
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    color: #3d6a74;
    margin-left: 0.15em;
  }

  .reveal-badge--pending .reveal-badge__value {
    font-size: 1.35rem;
    color: #6a8a92;
  }

  .reveal-badge--pending .reveal-badge__unit {
    font-size: 0.72rem;
    color: #6a8a92;
  }

  .arena__seats {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 22px;
  }

  .arena__seats--revealed .seat {
    animation: seat-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i) * 70ms);
  }

  .seat {
    width: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .seat--off {
    opacity: 0.55;
  }

  .seat__card,
  .seat__watch {
    width: 64px;
    height: 92px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    transition:
      transform 200ms ease,
      box-shadow 200ms ease,
      width 200ms ease,
      height 200ms ease;
  }

  .seat__card {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
  }

  .seat__watch {
    border: 2px solid rgba(22, 93, 112, 0.18);
    background: rgba(255, 255, 255, 0.35);
    color: rgba(22, 93, 112, 0.55);
    box-shadow: none;
  }

  .seat--watching {
    opacity: 0.92;
  }

  .arena__seats--revealed .seat__card,
  .arena__seats--revealed .seat__watch {
    width: 76px;
    height: 108px;
  }

  .seat--voted .seat__card {
    transform: translateY(-4px);
  }

  .seat--shown .seat__card {
    transform: translateY(-8px);
    box-shadow: 0 14px 26px rgba(15, 60, 70, 0.22);
  }

  .seat__value {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 2px solid #111;
    background: #fff;
    color: #0b5d70;
    font-size: 1.7rem;
    font-weight: 800;
    line-height: 1;
  }

  .arena__seats--revealed .seat__value {
    font-size: 2rem;
  }

  .seat__back {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    border: 2px solid #0b3d4a;
    background:
      repeating-linear-gradient(
        -45deg,
        #165d70,
        #165d70 5px,
        #1f7488 5px,
        #1f7488 10px
      );
  }

  .seat__figure {
    width: 72px;
    height: 86px;
    display: grid;
    place-items: end center;
    filter: drop-shadow(0 8px 14px rgba(22, 93, 112, 0.14));
  }

  .seat__empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 2px dashed rgba(22, 93, 112, 0.45);
    background: rgba(255, 255, 255, 0.45);
    color: #6a8a92;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .seat__who {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    max-width: 96px;
  }

  .seat__who--figure {
    margin-top: -4px;
  }

  .seat__avatar {
    width: 34px;
    height: 40px;
    display: grid;
    place-items: center;
  }

  .seat__name {
    font-size: 0.75rem;
    font-weight: 800;
    text-align: center;
    line-height: 1.15;
    color: #123;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .seat__name em {
    font-style: normal;
    margin-left: 3px;
    font-size: 0.62rem;
    color: var(--color-brand);
    text-transform: uppercase;
  }

  .seat__meta {
    font-size: 0.62rem;
    font-weight: 600;
    color: #4a6a72;
    text-align: center;
    line-height: 1.2;
  }

  .arena__hand-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 0 4px;
  }

  .arena__hand-hint,
  .arena__observe {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--color-brand-dark);
    text-align: center;
  }

  .arena__hand-hint {
    opacity: 0.45;
    transform: translateY(4px);
    transition:
      opacity 280ms ease,
      transform 280ms ease;
  }

  .arena__hand-hint--ready {
    opacity: 1;
    transform: none;
  }

  .arena__observe {
    max-width: 420px;
    line-height: 1.4;
    color: #355;
  }

  .arena__observe--pulse {
    color: #c77800;
    animation: text-pulse 1.1s ease-in-out infinite;
  }

  .arena__observe--soft {
    font-weight: 600;
    color: #5a7a82;
  }

  .arena__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;
  }

  .setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: min(100%, 420px);
  }

  .setup__block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .setup__label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a7a82;
  }

  .setup__chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .setup__chips--teams {
    margin-top: 2px;
  }

  .setup__chip {
    min-height: 36px;
    padding: 0.4em 0.9em;
    border: 1.5px solid rgba(22, 93, 112, 0.28);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.88);
    color: var(--color-brand);
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      background 160ms ease,
      color 160ms ease,
      border-color 160ms ease;
  }

  .setup__chip:hover {
    border-color: var(--color-brand);
    background: rgba(33, 172, 195, 0.1);
  }

  .setup__chip--on {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: white;
  }

  .setup__chip--on:hover {
    background: var(--color-brand-hover);
    border-color: var(--color-brand-hover);
    color: white;
  }

  .setup__chip--team {
    border-radius: 12px;
  }

  .arena__cancel {
    margin-top: 2px;
    padding: 0;
    border: 0;
    background: none;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #c44536;
    cursor: pointer;
  }

  .arena__cancel:hover {
    text-decoration: underline;
  }

  .arena__estimate {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: min(100%, 240px);
  }

  .arena__estimate-label {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6a848c;
  }

  .arena__estimate-select {
    width: 100%;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid black;
    outline: none;
    background: white;
  }

  .arena__estimate-select:focus {
    border-color: var(--color-brand-dark);
  }

  .hand {
    --card-w: 58px;
    --card-h: 86px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 18px 4px 8px;
    perspective: 900px;
  }

  .hand:not(.hand--ready) {
    pointer-events: none;
  }

  .hand__card {
    --lift: 0px;
    position: relative;
    width: var(--card-w);
    height: var(--card-h);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-brand-dark);
    font-weight: 800;
    font-size: 1.2rem;
    cursor: pointer;
    transform: translateY(var(--lift));
    transform-style: preserve-3d;
  }

  .hand--ready .hand__card {
    transition: transform 180ms ease;
  }

  .hand__card:disabled {
    cursor: default;
  }

  .hand--ready .hand__card:hover {
    --lift: -14px;
  }

  .hand--ready .hand__card--selected {
    --lift: -22px;
    color: var(--color-brand);
  }

  .hand--ready .hand__card--selected .hand__card-face {
    border-color: var(--color-brand);
    box-shadow:
      0 10px 0 var(--color-brand-dark),
      0 16px 28px rgba(22, 93, 112, 0.35);
  }

  .hand--ready .hand__card--pick {
    animation: hand-pick 460ms cubic-bezier(0.34, 1.45, 0.64, 1);
  }

  .hand__card--special {
    font-size: 1rem;
  }

  .hand__card-motion {
    display: block;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transform: translateZ(0);
    animation: hand-rise-spread 580ms cubic-bezier(0.33, 0.1, 0.2, 1) both;
  }

  .hand__card-inner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: hand-flip 400ms cubic-bezier(0.4, 0.05, 0.2, 1) calc(560ms + var(--hi) * 32ms)
      both;
  }

  .hand__card-back,
  .hand__card-face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 2px solid #111;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    box-shadow: 0 8px 0 #0d3d48, 0 12px 20px rgba(0, 0, 0, 0.18);
  }

  .hand__card-back {
    transform: rotateY(180deg) translateZ(1px);
    border-color: #0b3d4a;
    background:
      radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.14), transparent 42%),
      repeating-linear-gradient(
        -45deg,
        #165d70,
        #165d70 5px,
        #1f7488 5px,
        #1f7488 10px
      );
  }

  .hand__card-face {
    transform: translateZ(1px);
    background: linear-gradient(180deg, #fff 0%, #f3fafb 100%);
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease;
  }

  .hand__card-value {
    display: block;
    line-height: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .hand__card-motion,
    .hand__card-inner,
    .hand--ready .hand__card--pick,
    .arena__hand-hint {
      animation: none !important;
      transition: none !important;
      opacity: 1;
    }

    .hand__card-motion {
      transform: rotate(calc((var(--hi) - var(--mid)) * 2.2deg));
    }

    .hand__card-inner {
      transform: rotateY(0deg) !important;
    }

    .arena__hand-hint {
      transform: none;
      opacity: 1;
    }
  }

  @keyframes hand-rise-spread {
    0% {
      opacity: 0;
      transform: translate3d(calc((var(--mid) - var(--hi)) * 28px), 52px, 0) rotate(0deg)
        scale(0.94);
    }
    28% {
      opacity: 1;
      transform: translate3d(calc((var(--mid) - var(--hi)) * 20px), 10px, 0) rotate(0deg) scale(1);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(calc((var(--hi) - var(--mid)) * 2.2deg));
    }
  }

  @keyframes hand-flip {
    0% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(0deg);
    }
  }

  @keyframes hand-pick {
    0% {
      transform: translateY(0px) scale(1);
    }
    42% {
      transform: translateY(-30px) scale(1.1);
    }
    100% {
      transform: translateY(-22px) scale(1);
    }
  }

  @keyframes arena-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes glow-burst {
    from {
      opacity: 0.2;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes badge-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes seat-pop {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.92);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes timer-pop {
    from {
      transform: scale(0.9);
    }
    55% {
      transform: scale(1.08);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes text-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
</style>
