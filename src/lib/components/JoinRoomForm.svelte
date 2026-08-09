<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import { ERROR_CODES, type ErrorCode } from '$lib/errors';
  import { t, te } from '$lib/i18n';
  import type { PlayerAvatarConfig } from '$lib/room/avatar';
  import { PLAYER_NAME_MAX, ROLE_LABEL_MAX } from '$lib/room/limits';
  import type { PlayerRole } from '$lib/room/protocol';

  type Props = {
    roomName: string;
    isPrivate: boolean;
    teams: { id: string; name: string }[];
    errorCode: ErrorCode | null;
    name?: string;
    password?: string;
    role?: PlayerRole;
    roleLabel?: string;
    teamId?: string;
    avatar: PlayerAvatarConfig;
    onsubmit: () => void;
    oneditAvatar: () => void;
    onclearPasswordError?: () => void;
  };

  let {
    roomName,
    isPrivate,
    teams,
    errorCode,
    name = $bindable(''),
    password = $bindable(''),
    role = $bindable<PlayerRole>('voter'),
    roleLabel = $bindable(''),
    teamId = $bindable(''),
    avatar,
    onsubmit,
    oneditAvatar,
    onclearPasswordError
  }: Props = $props();

  const passwordIncorrect = $derived(errorCode === ERROR_CODES.password_incorrect);
</script>

<form
  class="join"
  onsubmit={(e) => {
    e.preventDefault();
    onsubmit();
  }}
>
  <button type="submit" class="join__submit-sr">{t('join.enter')}</button>

  <div class="join__intro">
    <p class="join__eyebrow">{isPrivate ? t('join.privateRoom') : t('join.publicRoom')}</p>
    <h2 class="join__title">{t('join.joinTitle', { roomName })}</h2>
    <p class="join__hint">{t('join.joinSubtitle')}</p>
  </div>

  <div
    class="join__avatar"
    role="button"
    tabindex="0"
    aria-label={t('join.editAvatar')}
    onclick={oneditAvatar}
    onkeydown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        oneditAvatar();
      }
    }}
  >
    <span class="join__avatar-preview" aria-hidden="true">
      <PlayerAvatar {avatar} size={64} />
    </span>
    <span class="join__avatar-meta">
      <strong>{t('join.yourAvatar')}</strong>
      <small>{t('join.tapToCustomize')}</small>
    </span>
  </div>

  <label class="form__label" for="join-name">{t('join.nameLabel')}</label>
  <input
    id="join-name"
    class="form__input form__input--compact"
    maxlength={PLAYER_NAME_MAX}
    autocomplete="nickname"
    placeholder={t('join.namePlaceholder')}
    bind:value={name}
  />

  {#if isPrivate}
    <label class="form__label" for="join-pass">{t('join.passwordLabel')}</label>
    <input
      id="join-pass"
      class="form__input form__input--compact"
      class:form__input--error={passwordIncorrect}
      type="password"
      autocomplete="current-password"
      placeholder={t('join.passwordPlaceholder')}
      aria-invalid={passwordIncorrect ? 'true' : undefined}
      aria-describedby={errorCode ? 'join-error' : undefined}
      bind:value={password}
      oninput={() => {
        if (passwordIncorrect) onclearPasswordError?.();
      }}
    />
  {/if}

  <p class="form__label" id="join-role-label">{t('join.participationLabel')}</p>
  <div class="join__roles" role="radiogroup" aria-labelledby="join-role-label">
    <label class="form__choice">
      <input type="radio" name="join-role" value="voter" bind:group={role} />
      <span>
        <strong>{t('join.voteLabel')}</strong>
        <small>{t('join.voteHint')}</small>
      </span>
    </label>
    <label class="form__choice">
      <input type="radio" name="join-role" value="observer" bind:group={role} />
      <span>
        <strong>{t('join.observeLabel')}</strong>
        <small>{t('join.observeHint')}</small>
      </span>
    </label>
  </div>

  <label class="form__label" for="join-label">{t('join.roleLabelOptional')}</label>
  <input
    id="join-label"
    class="form__input form__input--compact"
    placeholder={t('join.roleLabelPlaceholder')}
    maxlength={ROLE_LABEL_MAX}
    bind:value={roleLabel}
  />

  {#if teams.length > 0}
    <label class="form__label" for="join-team">{t('join.teamLabel')}</label>
    <select
      id="join-team"
      class="form__input form__input--compact form__select"
      bind:value={teamId}
    >
      <option value="">{t('join.noTeam')}</option>
      {#each teams as team (team.id)}
        <option value={team.id}>{team.name}</option>
      {/each}
    </select>
  {/if}

  <div class="join__feedback" aria-live="polite">
    {#if errorCode}
      <p id="join-error" class="join__error" role="alert">{te(errorCode)}</p>
    {/if}
  </div>

  <div class="join__actions">
    <LiquidButton text={t('join.enter')} type="submit" />
  </div>
</form>

<style>
  .join {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(100%, 440px);
    margin: 4px auto 0;
    padding: 4px 0 28px;
  }

  .join__submit-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .join__intro {
    text-align: center;
    margin-bottom: 14px;
  }

  .join__eyebrow {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-brand);
  }

  .join__title {
    margin: 4px 0 6px;
    font-family: var(--font-body);
    font-size: 1.4rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .join__hint {
    margin: 0;
    color: #555;
    line-height: 1.45;
    font-size: 0.95rem;
  }

  .join__avatar {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 2px solid black;
    border-radius: 0.75rem;
    background: white;
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .join__avatar:hover,
  .join__avatar:focus-visible {
    border-color: var(--color-brand-dark);
    outline: none;
  }

  .join__avatar-preview {
    width: 64px;
    height: 74px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .join__avatar-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .join__avatar-meta strong {
    font-size: 1rem;
  }

  .join__avatar-meta small {
    color: #555;
    font-size: 0.85rem;
  }

  .join__roles {
    display: flex;
    flex-direction: column;
    margin-bottom: 2px;
  }

  .join__roles :global(.form__choice) {
    padding: 10px 14px;
    margin-bottom: 8px;
  }

  .join__feedback {
    min-height: 1.2rem;
    margin-bottom: 4px;
  }

  .join__error {
    margin: 0;
    color: var(--color-error);
    font-weight: 700;
  }

  .join__actions {
    display: flex;
    justify-content: center;
    padding-bottom: 4px;
  }

  .join__actions :global(.button) {
    width: 100%;
  }
</style>
