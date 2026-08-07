<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    title: string;
    description: string;
    children?: Snippet;
  };

  let { title, description, children }: Props = $props();
</script>

<section class="notice">
  <img class="notice__visual" src="/assets/gif/doge.gif" alt="" />
  <h1 class="notice__title">{title}</h1>
  <p class="notice__copy">{description}</p>
  {#if children}
    <div class="notice__actions">
      {@render children()}
    </div>
  {/if}
</section>

<style>
  .notice {
    display: flex;
    min-height: 70vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    user-select: none;
    padding: 24px;
    font-family: var(--font-body);
  }

  .notice__visual {
    height: 220px;
    width: auto;
    margin-bottom: 16px;
  }

  .notice__title {
    margin: 0;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 1.85rem;
    color: var(--color-text);
  }

  .notice__copy {
    margin: 12px 0 24px;
    max-width: 38ch;
    font-size: 1.05rem;
    line-height: 1.55;
    color: #555;
  }

  .notice__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  @media (min-width: 576px) {
    .notice__visual {
      height: 280px;
    }

    .notice__title {
      font-size: 2.4rem;
    }
  }
</style>
