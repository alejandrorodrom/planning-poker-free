<script lang="ts">
  type Props = {
    userName?: string;
  };

  let { userName }: Props = $props();
</script>

<header class="navbar">
  <a class="navbar__logo" href="/">
    <img
      src="/assets/svg/planning-poker.svg"
      class="navbar__logo-icon"
      alt="Planning Poker"
      width="60"
      height="60"
    />
    <h2 class="navbar__logo-title">Planning Poker</h2>
  </a>

  {#if userName}
    <div class="navbar__user">
      <h3 class="navbar__user-name">{userName}</h3>
    </div>
  {/if}
</header>

<style>
  .navbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 15px;
    margin: 0 15px;
    justify-content: space-between;
  }

  .navbar__logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    user-select: none;
    text-decoration: none;
    color: inherit;
  }

  .navbar__logo-icon {
    width: 60px;
    height: auto;
  }

  .navbar__logo-title {
    margin: 0 0 0 15px;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.5rem;
  }

  .navbar__user {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .navbar__user-name {
    margin: 0;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1rem;
  }

  @media (max-width: 575px) {
    .navbar__logo-title {
      display: none;
    }
  }
</style>
