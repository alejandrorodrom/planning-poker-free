<script lang="ts">
  import { tick } from 'svelte';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import StoryStatusChip from '$lib/components/StoryStatusChip.svelte';
  import { formatEstimateLabel } from '$lib/room/decks';
  import { STORY_TITLE_MAX } from '$lib/room/limits';
  import { MODERATOR_LABEL } from '$lib/room/roleLabel';
  import type { StoryPublic } from '$lib/room/protocol';

  type Props = {
    open: boolean;
    stories: StoryPublic[];
    activeStoryId?: string | null;
    selectedStoryId?: string;
    canManage?: boolean;
    draftTitle?: string;
    oncreate?: () => void;
    onselect?: (storyId: string) => void;
    onupdate?: (storyId: string, title: string) => void;
    ondelete?: (storyId: string) => void;
    onclose: () => void;
  };

  let {
    open,
    stories,
    activeStoryId = null,
    selectedStoryId = '',
    canManage = false,
    draftTitle = $bindable(''),
    oncreate,
    onselect,
    onupdate,
    ondelete,
    onclose
  }: Props = $props();

  let editingId = $state<string | null>(null);
  let editTitle = $state('');
  let editInput = $state<HTMLInputElement | null>(null);
  let createInput = $state<HTMLInputElement | null>(null);

  const estimatedCount = $derived(stories.filter((s) => s.status === 'estimated').length);
  const description = $derived(
    stories.length === 0
      ? 'Aún no hay historias en esta sesión.'
      : `${estimatedCount} de ${stories.length} estimadas.`
  );
  const canCreate = $derived(draftTitle.trim().length > 0);
  const canSaveEdit = $derived(editTitle.trim().length > 0);

  function submitCreate() {
    if (!canCreate) return;
    oncreate?.();
  }

  async function startEdit(story: StoryPublic) {
    editingId = story.id;
    editTitle = story.title;
    await tick();
    editInput?.focus();
    editInput?.select();
  }

  function cancelEdit() {
    editingId = null;
    editTitle = '';
  }

  function saveEdit(storyId: string) {
    const title = editTitle.trim();
    if (!title) return;
    onupdate?.(storyId, title);
    cancelEdit();
  }

  function onEscape() {
    if (editingId) {
      cancelEdit();
      return;
    }
    onclose();
  }

  $effect(() => {
    if (!open) {
      cancelEdit();
      return;
    }
    if (canManage && !editingId) {
      void tick().then(() => createInput?.focus());
    }
  });
</script>

<ModalShell
  {open}
  title="Historias"
  titleId="stories-modal-title"
  eyebrow="Sala"
  {description}
  size="lg"
  {onclose}
  onescape={onEscape}
>
  {#if canManage}
    <form
      class="create"
      onsubmit={(event) => {
        event.preventDefault();
        submitCreate();
      }}
    >
      <label class="create__label" for="story-create-title">Nueva historia</label>
      <div class="create__row">
        <input
          id="story-create-title"
          class="create__input"
          type="text"
          maxlength={STORY_TITLE_MAX}
          placeholder="Ej. Login con SSO"
          aria-describedby="story-create-hint"
          bind:this={createInput}
          bind:value={draftTitle}
        />
        <LiquidButton text="Añadir" type="submit" disabled={!canCreate} />
      </div>
      <p id="story-create-hint" class="create__hint">
        {canCreate
          ? `${draftTitle.trim().length}/${STORY_TITLE_MAX}`
          : 'Escribe un título para poder añadirla.'}
      </p>
    </form>
  {/if}

  {#if stories.length === 0}
    <div class="empty">
      <span class="empty__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="40" height="40">
          <rect
            x="8"
            y="10"
            width="32"
            height="28"
            rx="6"
            fill="rgba(33, 172, 195, 0.12)"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M16 20h16M16 26h12M16 32h8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </span>
      <p class="empty__text">
        {canManage
          ? 'Añade la primera historia para empezar a votar.'
          : `El ${MODERATOR_LABEL} aún no ha añadido historias.`}
      </p>
    </div>
  {:else}
    <ul class="list">
      {#each stories as story (story.id)}
        {@const active = story.id === selectedStoryId || story.id === activeStoryId}
        {@const editing = editingId === story.id}
        <li class="item" class:item--active={active} class:item--editing={editing}>
          {#if editing}
            <form
              class="item__edit"
              onsubmit={(event) => {
                event.preventDefault();
                saveEdit(story.id);
              }}
            >
              <input
                class="item__edit-input"
                type="text"
                maxlength={STORY_TITLE_MAX}
                bind:this={editInput}
                bind:value={editTitle}
                aria-label="Editar título"
              />
              <button
                type="submit"
                class="item__action item__action--save"
                disabled={!canSaveEdit}
              >
                Guardar
              </button>
              <button type="button" class="item__action" onclick={cancelEdit}>Cancelar</button>
            </form>
          {:else}
            {#if canManage}
              <button
                type="button"
                class="item__title"
                class:item__title--active={active}
                onclick={() => onselect?.(story.id)}
              >
                {story.title}
              </button>
            {:else}
              <span class="item__title item__title--static">{story.title}</span>
            {/if}
            <StoryStatusChip
              status={story.status}
              suffix={story.estimates.overall
                ? formatEstimateLabel(story.estimates.overall)
                : undefined}
            />
            {#if canManage}
              <div class="item__actions">
                <button
                  type="button"
                  class="item__icon"
                  aria-label={`Editar ${story.title}`}
                  onclick={() => startEdit(story)}
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
                  class="item__icon item__icon--danger"
                  aria-label={`Eliminar ${story.title}`}
                  onclick={() => ondelete?.(story.id)}
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
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#snippet footer()}
    <button type="button" class="modal-ghost" onclick={onclose}>Cerrar</button>
  {/snippet}
</ModalShell>

<style>
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
    transition: border-color 160ms ease, box-shadow 160ms ease;
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

  .empty {
    display: grid;
    justify-items: center;
    gap: 10px;
    margin: 4px 0 8px;
    padding: 28px 16px;
    text-align: center;
    border-radius: 16px;
    border: 1px dashed rgba(22, 93, 112, 0.22);
    background: rgba(245, 250, 251, 0.7);
  }

  .empty__icon {
    color: var(--color-brand);
  }

  .empty__text {
    margin: 0;
    max-width: 22rem;
    font-size: 0.95rem;
    line-height: 1.45;
    color: #5a757c;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    background: #f5fafb;
    border: 1px solid rgba(22, 93, 112, 0.1);
  }

  .item--active {
    border-color: rgba(33, 172, 195, 0.45);
    background: linear-gradient(145deg, rgba(33, 172, 195, 0.12), #f7fbfc 55%);
  }

  .item--editing {
    border-color: rgba(22, 93, 112, 0.35);
  }

  .item__title {
    flex: 1;
    min-width: 0;
    text-align: left;
    border: none;
    background: transparent;
    padding: 0;
    font-family: var(--font-body);
    font-size: 0.98rem;
    font-weight: 700;
    color: var(--color-brand);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .item__title--active {
    color: var(--color-brand-active);
  }

  .item__title--static {
    text-decoration: none;
    cursor: default;
    color: #123;
  }

  .item__edit {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .item__edit-input {
    flex: 1;
    min-width: 10rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0.55rem 0.75rem;
    border-radius: 0.45rem;
    border: 2px solid rgba(22, 93, 112, 0.28);
    outline: none;
    background: white;
  }

  .item__edit-input:focus {
    border-color: var(--color-brand-dark);
  }

  .item__action {
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

  .item__action:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .item__action--save {
    color: var(--color-brand);
  }

  .item__actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
  }

  .item__icon {
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

  .item__icon:hover {
    background: rgba(22, 93, 112, 0.1);
    color: var(--color-brand-dark);
  }

  .item__icon--danger:hover {
    background: rgba(247, 56, 96, 0.12);
    color: var(--color-error);
  }
</style>
