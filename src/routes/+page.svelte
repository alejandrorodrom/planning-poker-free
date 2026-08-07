<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import { loadStoredAvatar } from '$lib/room/avatar';
  import { DECKS, DEFAULT_DECK, type DeckId } from '$lib/room/decks';
  import {
    PASSWORD_MAX,
    PLAYER_NAME_MAX,
    ROOM_NAME_MAX
  } from '$lib/room/limits';
  import type { EstimateRule, RevealMode } from '$lib/room/protocol';
  import { saveSession } from '$lib/room/session';

  const STEPS = [
    { id: 1, title: 'Tu nombre', hint: 'Así te verá el equipo en la mesa.' },
    {
      id: 2,
      title: 'Tu sala',
      hint: 'Ponle un nombre claro al equipo. Pública por defecto; puedes protegerla con contraseña.'
    },
    { id: 3, title: 'Cómo votar', hint: 'Baraja, estimación y revelado. Puedes dejar los valores recomendados.' }
  ] as const;

  let step = $state(1);
  let name = $state('');
  let roomName = $state('');
  let isPrivate = $state(false);
  let password = $state('');
  let deck = $state<DeckId>(DEFAULT_DECK);
  let estimateRule = $state<EstimateRule>('consensus');
  let revealMode = $state<RevealMode>('hidden');
  let error = $state('');
  let loading = $state(false);

  const deckOptions = Object.values(DECKS);
  const currentStep = $derived(STEPS[step - 1]!);

  $effect(() => {
    if (!error) return;
    if (error === 'Elige un nombre para mostrar' && name.trim()) {
      error = '';
      return;
    }
    if (error === 'Elige un nombre para la sala' && roomName.trim()) {
      error = '';
      return;
    }
    if (error === 'Las salas privadas necesitan contraseña' && (!isPrivate || password.trim())) {
      error = '';
    }
  });

  function goNext() {
    error = '';
    if (step === 1) {
      if (!name.trim()) {
        error = 'Elige un nombre para mostrar';
        return;
      }
    }
    if (step === 2) {
      if (!roomName.trim()) {
        error = 'Elige un nombre para la sala';
        return;
      }
      if (isPrivate && !password.trim()) {
        error = 'Las salas privadas necesitan contraseña';
        return;
      }
    }
    if (step < STEPS.length) step += 1;
  }

  function goBack() {
    error = '';
    if (step > 1) step -= 1;
  }

  async function createRoom() {
    const trimmed = name.trim();
    if (!trimmed) {
      error = 'Elige un nombre para mostrar';
      step = 1;
      return;
    }
    const trimmedRoom = roomName.trim();
    if (!trimmedRoom) {
      error = 'Elige un nombre para la sala';
      step = 2;
      return;
    }
    if (isPrivate && !password.trim()) {
      error = 'Las salas privadas necesitan contraseña';
      step = 2;
      return;
    }

    error = '';
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
        error = data.message ?? 'No se pudo crear la sala';
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
      error = 'Error de red al crear la sala';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Planning Poker Free</title>
</svelte:head>

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
    Estima en tiempo real con tu equipo. Crea una sala, comparte el link y vota.
  </p>

  <form
    class="form"
    onsubmit={(event) => {
      event.preventDefault();
      if (step < STEPS.length) goNext();
      else void createRoom();
    }}
  >
    <div class="steps" aria-label="Progreso">
      {#each STEPS as item (item.id)}
        <span
          class="steps__dot"
          class:steps__dot--done={item.id < step}
          class:steps__dot--current={item.id === step}
        ></span>
      {/each}
    </div>

    <p class="form__step-label">Paso {step} de {STEPS.length}</p>
    <h2 class="form__step-title">{currentStep.title}</h2>
    <p class="form__step-hint">{currentStep.hint}</p>

    {#if step === 1}
      <label class="form__label" for="display-name">Nombre para mostrar</label>
      <input
        id="display-name"
        class="form__input"
        class:form__input--error={error === 'Elige un nombre para mostrar'}
        type="text"
        maxlength={PLAYER_NAME_MAX}
        autocomplete="nickname"
        bind:value={name}
        placeholder="Ej. Alex"
        aria-invalid={error === 'Elige un nombre para mostrar'}
        aria-describedby={error === 'Elige un nombre para mostrar' ? 'form-error' : undefined}
      />
    {:else if step === 2}
      <label class="form__label" for="room-name">Nombre de la sala</label>
      <input
        id="room-name"
        class="form__input"
        class:form__input--error={error === 'Elige un nombre para la sala'}
        type="text"
        maxlength={ROOM_NAME_MAX}
        bind:value={roomName}
        placeholder="Ej. Sprint 24 · Equipo Platform"
        aria-invalid={error === 'Elige un nombre para la sala'}
        aria-describedby={error === 'Elige un nombre para la sala' ? 'form-error' : undefined}
      />

      <label class="form__choice">
        <input type="radio" name="privacy" checked={!isPrivate} onchange={() => (isPrivate = false)} />
        <span>
          <strong>Pública</strong>
          <small>Cualquiera con el link entra</small>
        </span>
      </label>
      <label class="form__choice">
        <input type="radio" name="privacy" checked={isPrivate} onchange={() => (isPrivate = true)} />
        <span>
          <strong>Privada</strong>
          <small>Pide contraseña al unirse</small>
        </span>
      </label>

      {#if isPrivate}
        <label class="form__label" for="room-password">Contraseña</label>
        <input
          id="room-password"
          class="form__input"
          class:form__input--error={error === 'Las salas privadas necesitan contraseña'}
          type="password"
          maxlength={PASSWORD_MAX}
          autocomplete="new-password"
          bind:value={password}
          placeholder="Contraseña de la sala"
          aria-invalid={error === 'Las salas privadas necesitan contraseña'}
          aria-describedby={
            error === 'Las salas privadas necesitan contraseña' ? 'form-error' : undefined
          }
        />
      {/if}
    {:else}
      <label class="form__label" for="deck">Baraja</label>
      <select id="deck" class="form__input form__select" bind:value={deck}>
        {#each deckOptions as option (option.id)}
          <option value={option.id}>{option.label}</option>
        {/each}
      </select>

      <label class="form__label" for="estimate-rule">Cálculo de la estimación</label>
      <select id="estimate-rule" class="form__input form__select" bind:value={estimateRule}>
        <option value="consensus">Consenso (recomendado)</option>
        <option value="mode">Moda</option>
        <option value="median">Mediana</option>
        <option value="mean">Media</option>
      </select>

      <label class="form__label" for="reveal-mode">Revelado</label>
      <select id="reveal-mode" class="form__input form__select" bind:value={revealMode}>
        <option value="hidden">Oculto hasta revelar</option>
        <option value="live">Siempre visible</option>
      </select>
    {/if}

    <div class="form__nav" class:form__nav--split={step > 1}>
      {#if error}
        <p id="form-error" class="form__error form__error--float" role="alert">{error}</p>
      {/if}
      {#if step > 1}
        <button type="button" class="form__back" onclick={goBack}>Atrás</button>
      {/if}
      <div class="form__button">
        <LiquidButton
          text={step < STEPS.length ? 'Continuar' : loading ? 'Creando…' : 'Crear sala'}
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
