<script lang="ts">
  import { goto } from '$app/navigation';
  import LiquidButton from '$lib/components/LiquidButton.svelte';

  let name = $state('');
  let isPrivate = $state(false);
  let password = $state('');
  let error = $state('');

  function createRoom() {
    const trimmed = name.trim();

    if (!trimmed) {
      error = 'Elige un nombre para mostrar';
      return;
    }

    if (isPrivate && !password.trim()) {
      error = 'Las salas privadas necesitan contraseña';
      return;
    }

    error = '';

    // Placeholder room id until Durable Objects wire-up
    const roomId = crypto.randomUUID().slice(0, 8);
    const params = new URLSearchParams({ name: trimmed });
    if (isPrivate) params.set('private', '1');

    goto(`/room/${roomId}?${params.toString()}`);
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
      createRoom();
    }}
  >
    <label class="form__label" for="display-name">Nombre para mostrar</label>
    <input
      id="display-name"
      class="form__input"
      type="text"
      maxlength="24"
      autocomplete="nickname"
      bind:value={name}
      placeholder="Ej. Alex"
    />

    <label class="form__private">
      <input type="checkbox" bind:checked={isPrivate} />
      Sala privada
    </label>

    {#if isPrivate}
      <label class="form__label" for="room-password">Contraseña</label>
      <input
        id="room-password"
        class="form__input"
        type="password"
        maxlength="64"
        autocomplete="new-password"
        bind:value={password}
        placeholder="Contraseña de la sala"
      />
    {/if}

    {#if error}
      <p class="form__error" role="alert">{error}</p>
    {/if}

    <div class="form__button">
      <LiquidButton text="Crear sala" type="submit" />
    </div>
  </form>
</section>

<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    padding: 24px 16px 48px;
    user-select: none;
    width: min(100%, 600px);
    margin: 0 auto;
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

  .form__label {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .form__input {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1.2rem;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 2px solid black;
    outline: none;
    width: 100%;
    margin-bottom: 16px;
  }

  .form__input:focus,
  .form__input:active {
    border-color: var(--color-brand-dark);
  }

  .form__private {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-weight: 600;
    margin-bottom: 16px;
    cursor: pointer;
  }

  .form__error {
    color: var(--color-error);
    font-weight: 600;
    margin: 0 0 12px;
  }

  .form__button {
    margin-top: 8px;
    display: flex;
    justify-content: center;
  }

  .form__button :global(.button) {
    width: 100%;
  }

  @media (max-width: 575px) {
    .hero {
      width: min(100%, 250px);
      margin-top: 50px;
    }
  }

  @media (min-width: 576px) {
    .hero {
      width: min(100%, 300px);
    }
  }

  @media (min-width: 768px) {
    .hero {
      width: min(100%, 400px);
    }
  }

  @media (min-width: 992px) {
    .hero {
      width: min(100%, 600px);
    }
  }
</style>
