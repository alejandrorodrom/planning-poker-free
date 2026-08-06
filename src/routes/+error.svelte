<script lang="ts">
  import { page } from '$app/state';
</script>

<section class="not-found">
  <img class="doge" src="/assets/gif/doge.gif" alt="Doge" />
  <h1 class="title">{page.status === 404 ? '404' : page.status}</h1>
  <p class="description">
    {page.status === 404 ? 'Página no encontrada' : (page.error?.message ?? 'Algo salió mal')}
  </p>
  <a class="back" href="/">Volver al inicio</a>
</section>

<style>
  .not-found {
    display: flex;
    min-height: 70vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    user-select: none;
    padding: 24px;
    text-align: center;
  }

  .doge {
    height: 280px;
    width: auto;
    margin-bottom: 16px;
  }

  .title {
    font-family: var(--font-body);
    font-weight: bold;
    margin: 0;
    font-size: 35px;
  }

  .description {
    font-family: var(--font-body);
    margin: 12px 0 24px;
    font-size: 20px;
  }

  .back {
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-brand);
    text-decoration: none;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .back:hover {
    text-decoration: underline;
  }

  @media (min-width: 576px) {
    .doge {
      height: 350px;
    }

    .title {
      font-size: 50px;
    }

    .description {
      font-size: 25px;
    }
  }

  @media (min-width: 768px) {
    .doge {
      height: 450px;
    }

    .title {
      font-size: 75px;
    }
  }

  @media (min-width: 992px) {
    .doge {
      height: 500px;
    }
  }
</style>
