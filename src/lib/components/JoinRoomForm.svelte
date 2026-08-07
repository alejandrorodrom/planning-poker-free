<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import type { PlayerAvatarConfig } from '$lib/room/avatar';
  import { PLAYER_NAME_MAX, ROLE_LABEL_MAX } from '$lib/room/limits';
  import type { PlayerRole } from '$lib/room/protocol';

  type Props = {
    roomName: string;
    isPrivate: boolean;
    teams: { id: string; name: string }[];
    error: string;
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
    error,
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
</script>

<form
  class="join"
  onsubmit={(e) => {
    e.preventDefault();
    onsubmit();
  }}
>
  <button type="submit" class="join__submit-sr">Entrar</button>

  <div class="join__intro">
    <p class="join__eyebrow">{isPrivate ? 'Sala privada' : 'Sala pública'}</p>
    <h2 class="join__title">Unirse a {roomName}</h2>
    <p class="join__hint">Elige cómo te verán en la mesa y entra a estimar con el equipo.</p>
  </div>

  <div
    class="join__avatar"
    role="button"
    tabindex="0"
    aria-label="Editar avatar"
    onclick={oneditAvatar}
    onkeydown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        oneditAvatar();
      }
    }}
  >
    <span class="join__avatar-preview" aria-hidden="true">
      <PlayerAvatar {avatar} size={72} />
    </span>
    <span class="join__avatar-meta">
      <strong>Tu avatar</strong>
      <small>Toca para personalizarlo</small>
    </span>
  </div>

  <label class="form__label" for="join-name">Nombre</label>
  <input
    id="join-name"
    class="form__input form__input--compact"
    maxlength={PLAYER_NAME_MAX}
    autocomplete="nickname"
    placeholder="Ej. Alex"
    bind:value={name}
  />

  {#if isPrivate}
    <label class="form__label" for="join-pass">Contraseña</label>
    <input
      id="join-pass"
      class="form__input form__input--compact"
      class:form__input--error={error === 'Contraseña incorrecta'}
      type="password"
      autocomplete="current-password"
      placeholder="Contraseña de la sala"
      aria-invalid={error === 'Contraseña incorrecta' ? 'true' : undefined}
      aria-describedby={error ? 'join-error' : undefined}
      bind:value={password}
      oninput={() => {
        if (error === 'Contraseña incorrecta') onclearPasswordError?.();
      }}
    />
  {/if}

  <p class="form__label" id="join-role-label">Cómo participar</p>
  <div class="join__roles" role="radiogroup" aria-labelledby="join-role-label">
    <label class="form__choice">
      <input type="radio" name="join-role" value="voter" bind:group={role} />
      <span>
        <strong>Votar</strong>
        <small>Participas en las estimaciones</small>
      </span>
    </label>
    <label class="form__choice">
      <input type="radio" name="join-role" value="observer" bind:group={role} />
      <span>
        <strong>Observar</strong>
        <small>Sigues la ronda sin votar</small>
      </span>
    </label>
  </div>

  <label class="form__label" for="join-label">Etiqueta (opcional)</label>
  <input
    id="join-label"
    class="form__input form__input--compact"
    placeholder="PO, BA, LT…"
    maxlength={ROLE_LABEL_MAX}
    bind:value={roleLabel}
  />

  {#if teams.length > 0}
    <label class="form__label" for="join-team">Equipo</label>
    <select
      id="join-team"
      class="form__input form__input--compact form__select"
      bind:value={teamId}
    >
      <option value="">Sin equipo</option>
      {#each teams as team (team.id)}
        <option value={team.id}>{team.name}</option>
      {/each}
    </select>
  {/if}

  <div class="join__feedback" aria-live="polite">
    {#if error}
      <p id="join-error" class="join__error" role="alert">{error}</p>
    {/if}
  </div>

  <div class="join__actions">
    <LiquidButton text="Entrar" type="submit" />
  </div>
</form>

<style>
  .join {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(100%, 440px);
    margin: 8px auto 0;
    padding: 8px 0 32px;
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
    margin-bottom: 20px;
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
    margin: 6px 0 8px;
    font-family: var(--font-body);
    font-size: 1.55rem;
    font-weight: 800;
    line-height: 1.2;
  }

  .join__hint {
    margin: 0;
    color: #555;
    line-height: 1.5;
    font-size: 0.98rem;
  }

  .join__avatar {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    margin-bottom: 18px;
    padding: 12px 14px;
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
    width: 72px;
    height: 84px;
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
    margin-bottom: 4px;
  }

  .join__feedback {
    min-height: 1.4rem;
    margin-bottom: 8px;
  }

  .join__error {
    margin: 0;
    color: var(--color-error);
    font-weight: 700;
  }

  .join__actions {
    display: flex;
    justify-content: center;
  }

  .join__actions :global(.button) {
    width: 100%;
  }
</style>
