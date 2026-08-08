<script lang="ts">
  import { tick } from 'svelte';
  import LiquidButton from './LiquidButton.svelte';
  import { TEAM_NAME_MAX } from '$lib/room/limits';

  type Team = { id: string; name: string };
  type Player = { id: string; name: string; teamId?: string | null };

  type Props = {
    teams: Team[];
    players?: Player[];
    title?: string;
    hint?: string;
    emptyLabel?: string;
    creatable?: boolean;
    manageable?: boolean;
    createPlaceholder?: string;
    createLabel?: string;
    autofocusCreate?: boolean;
    oncreate?: (name: string) => void;
    onrename?: (teamId: string, name: string) => void;
    ondelete?: (teamId: string) => void;
  };

  let {
    teams,
    players = [],
    title = 'Equipos',
    hint = 'Opcional. Úsalos para limitar quién vota en cada ronda.',
    emptyLabel = 'Todavía no hay equipos.',
    creatable = false,
    manageable = false,
    createPlaceholder = 'Ej. Front, Back, Mobile',
    createLabel = 'Añadir',
    autofocusCreate = false,
    oncreate,
    onrename,
    ondelete
  }: Props = $props();

  let draftName = $state('');
  let editingId = $state<string | null>(null);
  let editName = $state('');
  let editInputEl: HTMLInputElement | undefined = $state();
  let createInputEl: HTMLInputElement | undefined = $state();

  const canCreate = $derived(draftName.trim().length > 0);
  const canSaveEdit = $derived(editName.trim().length > 0);

  function membersOf(teamId: string) {
    return players.filter((player) => player.teamId === teamId);
  }

  function submitCreate() {
    const name = draftName.trim();
    if (!name || !oncreate) return;
    oncreate(name);
    draftName = '';
  }

  async function startEdit(team: Team) {
    editingId = team.id;
    editName = team.name;
    await tick();
    editInputEl?.focus();
    editInputEl?.select();
  }

  function cancelEdit() {
    editingId = null;
    editName = '';
  }

  function saveEdit(teamId: string) {
    const name = editName.trim();
    if (!name) return;
    onrename?.(teamId, name);
    cancelEdit();
  }

  $effect(() => {
    if (!autofocusCreate) {
      cancelEdit();
      return;
    }
    if (!creatable || editingId) return;
    void tick().then(() => createInputEl?.focus());
  });
</script>

<section class="teams">
  {#if title}
    <h3 class="teams__title">{title}</h3>
  {/if}
  {#if hint}
    <p class="teams__hint">{hint}</p>
  {/if}

  {#if creatable}
    <form
      class="create"
      onsubmit={(event) => {
        event.preventDefault();
        submitCreate();
      }}
    >
      <label class="create__label" for="team-create-name">Nuevo equipo</label>
      <div class="create__row">
        <input
          id="team-create-name"
          class="create__input"
          type="text"
          maxlength={TEAM_NAME_MAX}
          placeholder={createPlaceholder}
          aria-describedby="team-create-hint"
          bind:this={createInputEl}
          bind:value={draftName}
        />
        <LiquidButton text={createLabel} type="submit" disabled={!canCreate} />
      </div>
      <p id="team-create-hint" class="create__hint">
        {canCreate
          ? `${draftName.trim().length}/${TEAM_NAME_MAX}`
          : 'Escribe un nombre para poder añadirlo.'}
      </p>
    </form>
  {/if}

  {#if teams.length === 0}
    <p class="teams__empty">{emptyLabel}</p>
  {:else}
    <ul class="teams__list">
      {#each teams as team (team.id)}
        {@const members = membersOf(team.id)}
        {@const editing = editingId === team.id}
        <li class="teams__item" class:teams__item--editing={editing}>
          {#if editing}
            <form
              class="teams__edit"
              onsubmit={(event) => {
                event.preventDefault();
                saveEdit(team.id);
              }}
            >
              <input
                class="teams__edit-input"
                type="text"
                maxlength={TEAM_NAME_MAX}
                bind:value={editName}
                bind:this={editInputEl}
                aria-label="Editar nombre del equipo"
              />
              <button
                type="submit"
                class="teams__text-btn teams__text-btn--save"
                disabled={!canSaveEdit}
              >
                Guardar
              </button>
              <button type="button" class="teams__text-btn" onclick={cancelEdit}>Cancelar</button>
            </form>
          {:else}
            <div class="teams__main">
              <span class="teams__name">{team.name}</span>
              <span class="teams__count">
                {members.length}
                {members.length === 1 ? 'persona' : 'personas'}
              </span>
              {#if manageable}
                <div class="teams__actions">
                  <button
                    type="button"
                    class="teams__icon"
                    aria-label={`Editar ${team.name}`}
                    onclick={() => startEdit(team)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1 1 0 0 0 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.99-1.66z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="teams__icon teams__icon--danger"
                    aria-label={`Eliminar ${team.name}`}
                    onclick={() => ondelete?.(team.id)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </button>
                </div>
              {/if}
            </div>
            {#if members.length}
              <p class="teams__members">{members.map((member) => member.name).join(', ')}</p>
            {:else}
              <p class="teams__members teams__members--empty">Sin miembros aún</p>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .teams {
    margin: 0;
  }

  .teams__title {
    margin: 0 0 6px;
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 700;
  }

  .teams__hint,
  .teams__empty {
    margin: 0 0 14px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    line-height: 1.45;
    color: #555;
  }

  .teams__empty {
    margin-top: 4px;
    margin-bottom: 0;
  }

  .create {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0 0 16px;
    padding: 0 0 16px;
    border-bottom: 1px solid rgba(22, 93, 112, 0.1);
  }

  .create__label {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-brand);
  }

  .create__row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 10px;
  }

  .create__input {
    flex: 1 1 12rem;
    min-width: 0;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    border: 2px solid rgba(22, 93, 112, 0.28);
    outline: none;
    background: white;
    color: #0b3d4a;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .create__input::placeholder {
    color: #8aa3aa;
    font-weight: 500;
  }

  .create__input:focus {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px rgba(33, 172, 195, 0.18);
  }

  .create__row :global(.button) {
    flex: 0 0 auto;
    align-self: stretch;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.65em 1.35em;
    font-size: 0.92em;
  }

  .create__hint {
    margin: 0;
    min-height: 1.1em;
    font-size: 0.8rem;
    font-weight: 600;
    color: #6a848c;
  }

  .teams__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .teams__item {
    border: 1px solid var(--color-brand-soft);
    border-radius: var(--radius-md);
    background: #f8fbfc;
    padding: 12px 14px;
  }

  .teams__item--editing {
    border-color: rgba(22, 93, 112, 0.35);
  }

  .teams__main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .teams__name {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 1rem;
    flex: 1;
    min-width: 0;
  }

  .teams__count {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-brand);
    white-space: nowrap;
  }

  .teams__actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .teams__icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #5a7a82;
    cursor: pointer;
  }

  .teams__icon:hover {
    background: rgba(22, 93, 112, 0.1);
    color: var(--color-brand-dark);
  }

  .teams__icon--danger:hover {
    background: rgba(247, 56, 96, 0.12);
    color: var(--color-error);
  }

  .teams__edit {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .teams__edit-input {
    flex: 1;
    min-width: 8rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.55rem 0.75rem;
    border-radius: 0.45rem;
    border: 2px solid rgba(22, 93, 112, 0.28);
    outline: none;
    background: white;
  }

  .teams__edit-input:focus {
    border-color: var(--color-brand-dark);
  }

  .teams__text-btn {
    border: none;
    background: transparent;
    padding: 0.35rem 0.55rem;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #5a7a82;
    cursor: pointer;
  }

  .teams__text-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .teams__text-btn--save {
    color: var(--color-brand);
  }

  .teams__members {
    margin: 6px 0 0;
    font-family: var(--font-body);
    font-size: 0.85rem;
    line-height: 1.35;
    color: #444;
  }

  .teams__members--empty {
    color: #777;
  }
</style>
