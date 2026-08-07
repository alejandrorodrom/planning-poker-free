<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
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
</script>

<header class="topbar">
  <a class="topbar__brand" href="/" aria-label="Planning Poker — inicio">
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
    <p class="topbar__eyebrow">{isPrivate ? 'Sala privada' : 'Sala pública'}</p>
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
          aria-label="Nombre de la sala"
        />
        <div class="topbar__rename-actions">
          <LiquidButton text="Guardar" type="submit" />
          <button type="button" class="linkish" onclick={oncancelEditName}>Cancelar</button>
        </div>
      </form>
    {:else}
      <div class="topbar__title-row">
        <h1 class="topbar__title">{roomName}</h1>
        {#if isSm && !needsJoin}
          <button type="button" class="linkish topbar__edit-name" onclick={onstartEditName}>
            Editar
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="topbar__status">
    {#if showInvite}
      <button type="button" class="topbar__invite" onclick={oninvite}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-5.91.7L8.04 9.81A3 3 0 1 0 8 14.2l7.12 4.16c.05.02.09.04.14.04A2.99 2.99 0 1 0 18 16.08Z"
          />
        </svg>
        Invitar
      </button>
    {/if}
    {#if me}
      <button type="button" class="you" onclick={oneditAvatar} title="Editar avatar">
        <span class="you__avatar" aria-hidden="true">
          <PlayerAvatar avatar={me.avatar} size={40} />
        </span>
        <span class="you__meta">
          <span class="you__name">{me.name}</span>
          {#if meRoleLabel}
            <span class="you__role">{meRoleLabel}</span>
          {/if}
        </span>
      </button>
    {:else if connection === 'connecting' || connection === 'closed'}
      <span class="you you--plain you--connecting" role="status">
        <span class="connecting-dot" aria-hidden="true"></span>
        {connection === 'closed' ? 'Reconectando…' : 'Conectando…'}
      </span>
    {/if}
  </div>
</header>

<style>
  .topbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px 20px;
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
    padding-right: 20px;
    border-right: 1px solid rgba(22, 93, 112, 0.28);
  }

  .topbar__brand-icon {
    width: 60px;
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
    justify-self: start;
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
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .topbar__title-row {
    display: flex;
    flex-wrap: wrap;
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
  }

  .topbar__rename-input {
    margin-bottom: 0;
  }

  .topbar__rename-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .topbar__status {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    justify-self: end;
    flex-wrap: wrap;
  }

  .topbar__invite {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 42px;
    padding: 0.45em 1em;
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
    transition:
      color 180ms ease,
      background 180ms ease;
  }

  .topbar__invite:hover {
    background: var(--color-brand);
    color: white;
  }

  @media (max-width: 720px) {
    .topbar {
      grid-template-columns: auto 1fr;
      grid-template-areas:
        'brand status'
        'identity identity';
    }

    .topbar__brand {
      grid-area: brand;
      padding-right: 0;
      border-right: none;
    }

    .topbar__brand-title {
      display: none;
    }

    .topbar__identity {
      grid-area: identity;
    }

    .topbar__status {
      grid-area: status;
    }
  }

  .you {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px 8px 8px;
    border: 1px solid var(--color-brand-soft);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.85);
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .you:hover {
    border-color: var(--color-brand);
  }

  .you__avatar {
    width: 40px;
    height: 46px;
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
    padding: 10px 12px;
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
