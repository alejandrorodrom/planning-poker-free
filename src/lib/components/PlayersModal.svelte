<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import type { PlayerPublic, PlayerRole, Team } from '$lib/room/protocol';
  import { MODERATOR_LABEL, sanitizeRoleLabel } from '$lib/room/roleLabel';

  type Props = {
    open: boolean;
    players: PlayerPublic[];
    teams: Team[];
    meId: string | null;
    isSm: boolean;
    onassign: (payload: {
      playerId: string;
      role?: PlayerRole;
      teamId?: string | null;
    }) => void;
    onremove: (playerId: string, name: string) => void;
    onclose: () => void;
  };

  let { open, players, teams, meId, isSm, onassign, onremove, onclose }: Props = $props();

  const onlineCount = $derived(players.filter((p) => p.connection === 'connected').length);

  function connectionLabel(connection: PlayerPublic['connection']): string {
    if (connection === 'connected') return 'En línea';
    if (connection === 'pending') return 'Reconectando…';
    return 'Desconectado';
  }

  function teamLabel(teamId: string | null | undefined): string | null {
    if (!teamId) return null;
    return teams.find((t) => t.id === teamId)?.name ?? null;
  }
</script>

<ModalShell
  {open}
  title="Participantes"
  titleId="players-modal-title"
  eyebrow="Sala"
  description={`${onlineCount} en línea · ${players.length} en total`}
  hint={isSm ? 'Asigna quién vota y en qué equipo está.' : undefined}
  size="lg"
  {onclose}
>
  <ul class="list">
    {#each players as player (player.id)}
      {@const isMe = player.id === meId}
      {@const online = player.connection === 'connected'}
      {@const team = teamLabel(player.teamId)}
      {@const tag = sanitizeRoleLabel(player.roleLabel)}
      <li class="card" class:card--me={isMe} class:card--off={!online}>
        <div class="card__top">
          <div class="card__identity">
            <span class="avatar" class:avatar--me={isMe} aria-hidden="true">
              <PlayerAvatar avatar={player.avatar} size={48} />
            </span>
            <div class="card__copy">
              <div class="card__name-row">
                <span class="card__name">{player.name}</span>
                {#if isMe}<span class="pill pill--you">yo</span>{/if}
              </div>
              <div class="card__badges">
                {#if player.isScrumMaster}
                  <span class="pill pill--moderator">{MODERATOR_LABEL}</span>
                {/if}
                {#if tag}
                  <span class="pill">{tag}</span>
                {/if}
              </div>
              <p class="card__status">
                <span
                  class="dot"
                  class:dot--ok={online}
                  class:dot--pending={player.connection === 'pending'}
                  class:dot--off={!online && player.connection !== 'pending'}
                  aria-hidden="true"
                ></span>
                {connectionLabel(player.connection)}
                {#if !isSm}
                  · {player.role === 'observer' ? 'Observa' : 'Vota'}
                  {#if team} · {team}{/if}
                {/if}
              </p>
            </div>
          </div>

          {#if isSm && !isMe}
            <button
              type="button"
              class="remove"
              onclick={() => onremove(player.id, player.name)}
            >
              Quitar
            </button>
          {/if}
        </div>

        {#if isSm}
          <div class="card__controls" class:card__controls--teams={teams.length > 0}>
            <label class="field">
              <span class="field__label">Rol</span>
              <select
                class="field__select"
                value={player.role}
                onchange={(e) =>
                  onassign({
                    playerId: player.id,
                    role: (e.currentTarget as HTMLSelectElement).value as PlayerRole
                  })}
              >
                <option value="voter">Votar</option>
                <option value="observer">Observar</option>
              </select>
            </label>
            {#if teams.length > 0}
              <label class="field">
                <span class="field__label">Equipo</span>
                <select
                  class="field__select"
                  value={player.teamId ?? ''}
                  onchange={(e) => {
                    const v = (e.currentTarget as HTMLSelectElement).value;
                    onassign({ playerId: player.id, teamId: v || null });
                  }}
                >
                  <option value="">Sin equipo</option>
                  {#each teams as t (t.id)}
                    <option value={t.id}>{t.name}</option>
                  {/each}
                </select>
              </label>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  {#snippet footer()}
    <LiquidButton text="Cerrar" onclick={onclose} />
  {/snippet}
</ModalShell>

<style>
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: #f5fafb;
    border: 1px solid rgba(22, 93, 112, 0.1);
  }

  .card--me {
    border-color: rgba(33, 172, 195, 0.4);
    background: linear-gradient(145deg, rgba(33, 172, 195, 0.12), #f7fbfc 55%);
  }

  .card--off {
    opacity: 0.72;
  }

  .card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .card__identity {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }

  .avatar {
    width: 48px;
    height: 56px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.55);
  }

  .avatar--me {
    background: rgba(33, 172, 195, 0.16);
  }

  .card__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card__name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .card__name {
    font-weight: 800;
    font-size: 1.05rem;
    color: #123;
  }

  .card__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    background: rgba(22, 93, 112, 0.08);
    color: var(--color-brand-dark);
    border: 1px solid rgba(22, 93, 112, 0.14);
  }

  .pill--you {
    background: var(--color-brand);
    color: white;
    border-color: transparent;
    text-transform: uppercase;
  }

  .pill--moderator {
    background: rgba(33, 172, 195, 0.16);
    color: var(--color-brand-dark);
    border-color: rgba(33, 172, 195, 0.35);
  }

  .card__status {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #5a7a82;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: #bbb;
  }

  .dot--ok {
    background: var(--color-success);
    box-shadow: 0 0 0 3px rgba(54, 168, 72, 0.18);
  }

  .dot--pending {
    background: var(--color-alert);
    box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.18);
  }

  .dot--off {
    background: #b0b0b0;
  }

  .remove {
    border: none;
    background: transparent;
    color: var(--color-error);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 4px 2px;
    flex-shrink: 0;
  }

  .remove:hover {
    text-decoration: underline;
  }

  .card__controls {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .card__controls--teams {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 520px) {
    .card__controls--teams {
      grid-template-columns: 1fr;
    }
  }
</style>
