<script lang="ts">
  type Props = {
    name: string;
    active?: boolean;
    locked?: boolean;
    onclick?: () => void;
  };

  let { name, active = false, locked = false, onclick }: Props = $props();
</script>

<button class="card" type="button" {onclick}>
  {#if locked}
    <span class="card__lock" aria-label="Privada" title="Privada">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Zm7 14H7V10h10v10Zm-5-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </span>
  {/if}
  <span class="card__name">{name}</span>
  <span class="card__status" class:active class:inactive={!active}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
</button>

<style>
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    height: 150px;
    border-radius: var(--radius-xl);
    background-color: white;
    box-shadow: var(--shadow-card);
    overflow: hidden;
    margin: 20px;
    cursor: pointer;
    transition: all 200ms ease-in-out;
    border: none;
    width: 250px;
    padding: 0;
  }

  .card:hover {
    box-shadow: var(--shadow-card-hover);
  }

  .card__lock {
    position: absolute;
    top: 16px;
    color: gray;
    font-size: 1rem;
  }

  .card__name {
    font-family: var(--font-body);
    font-size: 25px;
    text-transform: uppercase;
    letter-spacing: 15px;
    margin-right: -15px;
    color: black;
  }

  .card__status {
    position: absolute;
    bottom: 24px;
    font-size: 18px;
  }

  .active {
    color: green;
    animation: brightness 2s infinite;
  }

  .inactive {
    color: red;
    animation: brightness 2s infinite;
  }

  @keyframes brightness {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.6);
    }
  }

  @media (min-width: 576px) {
    .card {
      width: 350px;
    }

    .card__name {
      font-size: 30px;
    }
  }

  @media (min-width: 768px) {
    .card {
      width: 300px;
    }
  }

  @media (min-width: 992px) {
    .card {
      width: 400px;
    }

    .card__name {
      font-size: 40px;
    }
  }
</style>
