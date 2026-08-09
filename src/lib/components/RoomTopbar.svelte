<script lang="ts">
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import { t } from '$lib/i18n';
  import type { PlayerAvatarConfig } from '$lib/room/avatar';
  import { ROOM_NAME_MAX } from '$lib/room/limits';

  type Props = {
    roomName: string;
    isPrivate: boolean;
    isSm: boolean;
    needsJoin: boolean;
    editingName: boolean;
    draftName?: string;
    showInvite: boolean;
    me?: { name: string; avatar: PlayerAvatarConfig } | null;
    meRoleLabel?: string;
    connection: 'connecting' | 'open' | 'closed';
    oninvite: () => void;
    oneditAvatar: () => void;
    onstartEditName: () => void;
    oncancelEditName: () => void;
    onsaveName: () => void;
  };

  let {
    roomName,
    isPrivate,
    isSm,
    needsJoin,
    editingName,
    draftName = $bindable(''),
    showInvite,
    me = null,
    meRoleLabel = '',
    connection,
    oninvite,
    oneditAvatar,
    onstartEditName,
    oncancelEditName,
    onsaveName
  }: Props = $props();

  const meTitle = $derived(
    me ? [me.name, meRoleLabel].filter(Boolean).join(' · ') : t('join.editAvatar')
  );
</script>

<header class="topbar">
  <a class="topbar__brand" href="/" aria-label="Planning Poker">
    <img
      src="/assets/svg/planning-poker.svg"
      class="topbar__brand-icon"
      alt=""
      width="60"
      height="60"
    />
    <span class="topbar__brand-title">Planning Poker</span>
  </a>

  <div class="topbar__identity">
    <p class="topbar__eyebrow">{isPrivate ? t('room.privateRoom') : t('room.publicRoom')}</p>
    {#if editingName && isSm}
      <form
        class="topbar__rename"
        onsubmit={(event) => {
          event.preventDefault();
          onsaveName();
        }}
      >
        <input
          class="form__input form__input--compact topbar__rename-input"
          maxlength={ROOM_NAME_MAX}
          bind:value={draftName}
          aria-label={t('room.roomNameLabel')}
        />
        <div class="topbar__rename-actions">
          <LiquidButton text={t('common.save')} type="submit" />
          <button type="button" class="linkish" onclick={oncancelEditName}>{t('common.cancel')}</button>
        </div>
      </form>
    {:else}
      <div class="topbar__title-row">
        <h1 class="topbar__title">{roomName}</h1>
        {#if isSm && !needsJoin}
          <button type="button" class="linkish topbar__edit-name" onclick={onstartEditName}>
            {t('common.edit')}
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="topbar__actions">
    <LanguageSwitcher compact />
    {#if showInvite}
      <button
        type="button"
        class="topbar__invite"
        onclick={oninvite}
        aria-label={t('room.invite')}
        title={t('room.invite')}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-5.91.7L8.04 9.81A3 3 0 1 0 8 14.2l7.12 4.16c.05.02.09.04.14.04A2.99 2.99 0 1 0 18 16.08Z"
          />
        </svg>
        <span class="topbar__invite-label">{t('room.invite')}</span>
      </button>
    {/if}
    {#if me}
      <button
        type="button"
        class="you"
        onclick={oneditAvatar}
        title={meTitle}
        aria-label={meTitle}
      >
        <span class="you__avatar" aria-hidden="true">
          <PlayerAvatar avatar={me.avatar} size={36} />
        </span>
        <span class="you__meta">
          <span class="you__name">{me.name}</span>
          {#if meRoleLabel}
            <span class="you__role">{meRoleLabel}</span>
          {/if}
        </span>
      </button>
    {:else if connection === 'connecting' || connection === 'closed'}
      <span class="you you--plain you--connecting" role="status" title={connection === 'closed' ? t('room.reconnecting') : t('room.connecting')}>
        <span class="connecting-dot" aria-hidden="true"></span>
        <span class="you__status-label"
          >{connection === 'closed' ? t('room.reconnecting') : t('room.connecting')}</span
        >
      </span>
    {/if}
  </div>
</header>

<style>
  .topbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px 16px;
    margin: 0 0 14px;
    padding: 8px 0 12px;
    border-bottom: 1px solid rgba(22, 93, 112, 0.12);
  }

  .topbar__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
    min-width: 0;
    padding-right: 16px;
    border-right: 1px solid rgba(22, 93, 112, 0.28);
  }

  .topbar__brand-icon {
    width: 56px;
    height: auto;
    flex-shrink: 0;
  }

  .topbar__brand-title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.5rem;
    white-space: nowrap;
  }

  .topbar__identity {
    min-width: 0;
  }

  .topbar__eyebrow {
    margin: 0 0 2px;
    font-weight: 700;
    color: var(--color-brand);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    font-size: 0.68rem;
  }

  .topbar__title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.55rem;
    margin: 0;
    line-height: var(--leading-tight);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .topbar__title-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: baseline;
    gap: 8px 10px;
    min-width: 0;
  }

  .topbar__edit-name {
    font-size: 0.78rem;
    flex-shrink: 0;
  }

  .topbar__rename {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 100%;
    min-width: 0;
  }

  .topbar__rename-input {
    margin-bottom: 0;
    min-width: 0;
    width: 100%;
  }

  .topbar__rename-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .topbar__rename-actions :global(.button) {
    font-size: 0.78rem;
    padding: 0.4em 1em;
    border-width: 2px;
    letter-spacing: 0.06em;
    min-height: 36px;
  }

  .topbar__actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: nowrap;
    flex-shrink: 0;
  }

  .topbar__invite {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 40px;
    padding: 0.4em 0.95em;
    border: 2px solid var(--color-brand);
    border-radius: var(--radius-xl);
    background: transparent;
    color: var(--color-brand);
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      color 180ms ease,
      background 180ms ease;
  }

  .topbar__invite:hover {
    background: var(--color-brand);
    color: white;
  }

  .you {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    border: 1px solid var(--color-brand-soft);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.85);
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-align: left;
    flex-shrink: 0;
  }

  .you:hover {
    border-color: var(--color-brand);
  }

  .you__avatar {
    width: 36px;
    height: 40px;
    display: grid;
    place-items: center;
  }

  .you__meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    min-width: 0;
  }

  .you__name {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .you__role {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-brand);
  }

  .you--plain {
    font-weight: 600;
    color: #666;
    padding: 8px 10px;
  }

  .you--connecting {
    gap: 8px;
    cursor: default;
    pointer-events: none;
  }

  .connecting-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-brand-accent);
    animation: connecting-pulse 1.1s ease-in-out infinite;
  }

  .linkish {
    background: none;
    border: none;
    color: var(--color-brand);
    font-weight: 700;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  /* BP_MOBILE — sync with src/lib/breakpoints.ts */
  @media (max-width: 720px) {
    .topbar {
      gap: 0 6px;
      margin: 0 0 6px;
      padding: 0 0 8px;
    }

    .topbar__brand {
      padding-right: 0;
      border-right: none;
    }

    .topbar__brand-icon {
      width: 36px;
    }

    .topbar__brand-title {
      display: none;
    }

    .topbar__eyebrow {
      margin: 0;
      letter-spacing: 0.08em;
      line-height: var(--leading-tight);
      font-size: var(--text-2xs);
    }

    .topbar__title {
      line-height: var(--leading-snug);
      font-size: var(--text-display-sm);
    }

    .topbar__title-row {
      gap: 6px;
    }

    .topbar__rename {
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .topbar__rename-input {
      flex: 1;
      min-width: 0;
      height: 34px;
      padding: 0.35rem 0.55rem;
      font-size: var(--text-md);
      font-weight: 700;
      border-width: 2px;
    }

    .topbar__rename-actions {
      flex-wrap: nowrap;
      flex-shrink: 0;
      gap: 6px;
    }

    .topbar__rename-actions :global(.button) {
      font-size: var(--text-2xs);
      padding: 0.3em 0.7em;
      min-height: 34px;
      letter-spacing: 0.04em;
      border-width: 2px;
    }

    .topbar__rename-actions .linkish {
      font-size: var(--text-xs);
      white-space: nowrap;
    }

    .topbar__actions {
      gap: 4px;
      align-self: center;
    }

    .topbar__actions :global(.lang-switch) {
      flex-shrink: 0;
      font-size: var(--text-xs);
      gap: 2px;
    }

    .topbar__actions :global(.lang-switch__btn) {
      padding: 2px;
      min-height: 32px;
    }

    .topbar__invite {
      width: 34px;
      height: 34px;
      min-height: 34px;
      padding: 0;
      gap: 0;
      border-radius: 999px;
      overflow: hidden;
    }

    .topbar__invite-label {
      display: none;
    }

    .topbar__invite svg {
      width: 15px;
      height: 15px;
    }

    .you {
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1.5px solid var(--color-brand-soft);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.95);
      gap: 0;
      overflow: hidden;
      justify-content: center;
    }

    .you__avatar {
      width: 100%;
      height: 100%;
    }

    .you__avatar :global(.avatar) {
      width: 34px;
      height: 34px;
    }

    .you__meta,
    .you__status-label {
      display: none;
    }

    .you--plain {
      width: auto;
      height: 34px;
      padding: 0 8px;
      border-radius: 999px;
    }
  }

  @keyframes connecting-pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.85);
    }
    50% {
      opacity: 1;
      transform: scale(1.15);
    }
  }
</style>
