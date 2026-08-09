<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { ERROR_CODES, isErrorCode, type ErrorCode } from '$lib/errors';
  import { loadStoredAvatar } from '$lib/room/avatar';
  import { DECK_IDS, DEFAULT_DECK, type DeckId } from '$lib/room/decks';
  import {
    PASSWORD_MAX,
    PLAYER_NAME_MAX,
    ROOM_NAME_MAX
  } from '$lib/room/limits';
  import type { EstimateRule, RevealMode } from '$lib/room/protocol';
  import { saveSession } from '$lib/room/session';
  import { isCanonicalHost } from '$lib/seo';
  import { deckLabel } from '$lib/i18n/labels';
  import { te, t } from '$lib/i18n';

  const indexable = $derived(isCanonicalHost(page.url.hostname));

  let step = $state(1);
  let name = $state('');
  let roomName = $state('');
  let isPrivate = $state(false);
  let password = $state('');
  let deck = $state<DeckId>(DEFAULT_DECK);
  let estimateRule = $state<EstimateRule>('consensus');
  let revealMode = $state<RevealMode>('hidden');
  let errorCode = $state<ErrorCode | null>(null);
  let errorMessage = $state('');
  let loading = $state(false);

  const steps = $derived([
    { id: 1, title: t('landing.step1Title'), hint: t('landing.step1Hint') },
    { id: 2, title: t('landing.step2Title'), hint: t('landing.step2Hint') },
    { id: 3, title: t('landing.step3Title'), hint: t('landing.step3Hint') }
  ]);
  const currentStep = $derived(steps[step - 1]!);
  const errorText = $derived(errorCode ? te(errorCode) : errorMessage);

  $effect(() => {
    if (!errorCode) return;
    if (errorCode === ERROR_CODES.display_name_required && name.trim()) {
      errorCode = null;
      return;
    }
    if (errorCode === ERROR_CODES.room_name_required && roomName.trim()) {
      errorCode = null;
      return;
    }
    if (errorCode === ERROR_CODES.password_required && (!isPrivate || password.trim())) {
      errorCode = null;
    }
  });

  function goNext() {
    errorCode = null;
    errorMessage = '';
    if (step === 1) {
      if (!name.trim()) {
        errorCode = ERROR_CODES.display_name_required;
        return;
      }
    }
    if (step === 2) {
      if (!roomName.trim()) {
        errorCode = ERROR_CODES.room_name_required;
        return;
      }
      if (isPrivate && !password.trim()) {
        errorCode = ERROR_CODES.password_required;
        return;
      }
    }
    if (step < steps.length) step += 1;
  }

  function goBack() {
    errorCode = null;
    errorMessage = '';
    if (step > 1) step -= 1;
  }

  async function createRoom() {
    const trimmed = name.trim();
    if (!trimmed) {
      errorCode = ERROR_CODES.display_name_required;
      step = 1;
      return;
    }
    const trimmedRoom = roomName.trim();
    if (!trimmedRoom) {
      errorCode = ERROR_CODES.room_name_required;
      step = 2;
      return;
    }
    if (isPrivate && !password.trim()) {
      errorCode = ERROR_CODES.password_required;
      step = 2;
      return;
    }

    errorCode = null;
    errorMessage = '';
    loading = true;

    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          roomName: trimmedRoom,
          isPrivate,
          password: isPrivate ? password : undefined,
          deck,
          estimateRule,
          revealMode,
          avatar: loadStoredAvatar()
        })
      });

      const data = (await res.json()) as {
        id?: string;
        playerId?: string;
        token?: string;
        message?: string;
      };

      if (!res.ok || !data.id || !data.playerId || !data.token) {
        if (isErrorCode(data.message)) {
          errorCode = data.message;
        } else {
          errorCode = ERROR_CODES.create_room_failed;
          errorMessage = data.message ?? '';
        }
        return;
      }

      saveSession({
        roomId: data.id,
        playerId: data.playerId,
        token: data.token,
        name: trimmed
      });

      void goto(resolve('/room/[id]', { id: data.id }));
    } catch {
      errorCode = ERROR_CODES.network_error;
    } finally {
      loading = false;
    }
  }
</script>

<SeoHead indexable={indexable} />

<section class="hero">
  <img
    src="/assets/svg/planning-poker.svg"
    class="hero__logo"
    alt="Planning Poker"
    width="120"
    height="120"
  />
  <h1 class="hero__title">Planning Poker</h1>
  <p class="hero__paragraph">
    {t('landing.heroSubtitle')}
  </p>

  <form
    class="form"
    onsubmit={(event) => {
      event.preventDefault();
      if (step < steps.length) goNext();
      else void createRoom();
    }}
  >
    <div class="steps" aria-label={t('landing.progress')}>
      {#each steps as item (item.id)}
        <span
          class="steps__dot"
          class:steps__dot--done={item.id < step}
          class:steps__dot--current={item.id === step}
        ></span>
      {/each}
    </div>

    <p class="form__step-label">{t('landing.stepOf', { step, total: steps.length })}</p>
    <h2 class="form__step-title">{currentStep.title}</h2>
    <p class="form__step-hint">{currentStep.hint}</p>

    {#if step === 1}
      <label class="form__label" for="display-name">{t('landing.displayNameLabel')}</label>
      <input
        id="display-name"
        class="form__input"
        class:form__input--error={errorCode === ERROR_CODES.display_name_required}
        type="text"
        maxlength={PLAYER_NAME_MAX}
        autocomplete="nickname"
        bind:value={name}
        placeholder={t('landing.displayNamePlaceholder')}
        aria-invalid={errorCode === ERROR_CODES.display_name_required}
        aria-describedby={errorCode === ERROR_CODES.display_name_required ? 'form-error' : undefined}
      />
    {:else if step === 2}
      <label class="form__label" for="room-name">{t('landing.roomNameLabel')}</label>
      <input
        id="room-name"
        class="form__input"
        class:form__input--error={errorCode === ERROR_CODES.room_name_required}
        type="text"
        maxlength={ROOM_NAME_MAX}
        bind:value={roomName}
        placeholder={t('landing.roomNamePlaceholder')}
        aria-invalid={errorCode === ERROR_CODES.room_name_required}
        aria-describedby={errorCode === ERROR_CODES.room_name_required ? 'form-error' : undefined}
      />

      <label class="form__choice">
        <input type="radio" name="privacy" checked={!isPrivate} onchange={() => (isPrivate = false)} />
        <span>
          <strong>{t('landing.publicLabel')}</strong>
          <small>{t('landing.publicHint')}</small>
        </span>
      </label>
      <label class="form__choice">
        <input type="radio" name="privacy" checked={isPrivate} onchange={() => (isPrivate = true)} />
        <span>
          <strong>{t('landing.privateLabel')}</strong>
          <small>{t('landing.privateHint')}</small>
        </span>
      </label>

      {#if isPrivate}
        <label class="form__label" for="room-password">{t('landing.passwordLabel')}</label>
        <input
          id="room-password"
          class="form__input"
          class:form__input--error={errorCode === ERROR_CODES.password_required}
          type="password"
          maxlength={PASSWORD_MAX}
          autocomplete="new-password"
          bind:value={password}
          placeholder={t('landing.passwordPlaceholder')}
          aria-invalid={errorCode === ERROR_CODES.password_required}
          aria-describedby={
            errorCode === ERROR_CODES.password_required ? 'form-error' : undefined
          }
        />
      {/if}
    {:else}
      <label class="form__label" for="deck">{t('landing.deckLabel')}</label>
      <select id="deck" class="form__input form__select" bind:value={deck}>
        {#each DECK_IDS as id (id)}
          <option value={id}>{deckLabel(id)}</option>
        {/each}
      </select>

      <label class="form__label" for="estimate-rule">{t('landing.estimateRuleLabel')}</label>
      <select id="estimate-rule" class="form__input form__select" bind:value={estimateRule}>
        <option value="consensus">{t('landing.consensusRecommended')}</option>
        <option value="mode">{t('landing.mode')}</option>
        <option value="median">{t('landing.median')}</option>
        <option value="mean">{t('landing.mean')}</option>
      </select>

      <label class="form__label" for="reveal-mode">{t('landing.revealModeLabel')}</label>
      <select id="reveal-mode" class="form__input form__select" bind:value={revealMode}>
        <option value="hidden">{t('landing.hiddenUntilReveal')}</option>
        <option value="live">{t('landing.alwaysVisible')}</option>
      </select>
    {/if}

    <div class="form__nav" class:form__nav--split={step > 1}>
      {#if errorText}
        <p id="form-error" class="form__error form__error--float" role="alert">{errorText}</p>
      {/if}
      {#if step > 1}
        <button type="button" class="form__back" onclick={goBack}>{t('common.back')}</button>
      {/if}
      <div class="form__button">
        <LiquidButton
          text={step < steps.length
            ? t('common.continue')
            : loading
              ? t('common.creating')
              : t('common.create')}
          type="submit"
        />
      </div>
    </div>
  </form>
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: safe center;
    flex: 1;
    width: min(100%, 600px);
    margin: 0 auto;
    padding: 24px 16px;
    user-select: none;
  }

  .hero__logo {
    height: 120px;
    width: auto;
  }

  .hero__title {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 400;
    text-align: center;
    margin: 10px 0;
  }

  .hero__paragraph {
    font-family: var(--font-body);
    font-weight: 400;
    text-align: center;
    margin: 0 0 24px;
    line-height: 1.5;
    max-width: 36ch;
  }

  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .steps {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .steps__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #d7e6ea;
    transition:
      background 180ms ease,
      transform 180ms ease;
  }

  .steps__dot--done {
    background: var(--color-brand-soft);
  }

  .steps__dot--current {
    background: var(--color-brand);
    transform: scale(1.25);
  }

  .form__step-label {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-brand);
    text-align: center;
  }

  .form__step-title {
    margin: 6px 0 4px;
    font-family: var(--font-body);
    font-size: 1.35rem;
    font-weight: 700;
    text-align: center;
  }

  .form__step-hint {
    margin: 0 0 20px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.45;
    text-align: center;
    color: #555;
  }

  .form__nav {
    position: relative;
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form__nav--split {
    flex-direction: row;
    align-items: center;
  }

  .form__back {
    align-self: center;
    border: none;
    background: transparent;
    font-family: var(--font-body);
    font-weight: 700;
    color: var(--color-brand);
    cursor: pointer;
    padding: 8px 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  .form__back:hover {
    text-decoration: underline;
  }

  .form__button {
    display: flex;
    justify-content: center;
    flex: 1;
    min-width: 0;
  }

  .form__button :global(.button) {
    width: 100%;
  }

  @media (max-width: 575px) {
    .hero {
      width: min(100%, 280px);
    }
  }

  @media (min-width: 576px) {
    .hero {
      width: min(100%, 320px);
    }
  }

  @media (min-width: 768px) {
    .hero {
      width: min(100%, 420px);
    }
  }

  @media (min-width: 992px) {
    .hero {
      width: min(100%, 520px);
    }
  }
</style>
