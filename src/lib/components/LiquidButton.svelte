<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';

  type Props = {
    text: string;
    href?: Pathname;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
  };

  let {
    text,
    href,
    type = 'button',
    class: className = '',
    disabled = false,
    onclick
  }: Props = $props();
</script>

{#if href}
  <a
    class="button {className}"
    class:button--disabled={disabled}
    href={disabled ? undefined : resolve(href)}
    aria-disabled={disabled || undefined}
    tabindex={disabled ? -1 : undefined}
    onclick={(event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onclick?.(event);
    }}
  >
    {text}
    <span class="button__blobs" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  </a>
{:else}
  <button class="button {className}" {type} {disabled} {onclick}>
    {text}
    <span class="button__blobs" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  </button>
{/if}

<svg
  xmlns="http://www.w3.org/2000/svg"
  style="display: block; height: 0; width: 0;"
  aria-hidden="true"
>
  <defs>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
      <feColorMatrix
        in="blur"
        mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
        result="goo"
      ></feColorMatrix>
      <feBlend in="SourceGraphic" in2="goo"></feBlend>
    </filter>
  </defs>
</svg>

<style>
  .button {
    font-size: 1em;
    font-family: var(--font-body);
    font-weight: 600;
    text-decoration: none;
    padding: 0.7em 1.8em;
    cursor: pointer;
    display: inline-block;
    vertical-align: middle;
    color: var(--color-brand);
    text-transform: uppercase;
    letter-spacing: 2px;
    border: 4px solid var(--color-brand);
    border-radius: var(--radius-xl);
    position: relative;
    transition: color 700ms ease;
    text-align: center;
    z-index: 1;
    user-select: none;
    background: transparent;
    appearance: none;
  }

  .button:hover:not(:disabled):not(.button--disabled) {
    color: #fff;
  }

  .button:hover:not(:disabled):not(.button--disabled) .button__blobs span {
    transform: scale(1.4) translateY(0) translateZ(0);
  }

  .button:disabled,
  .button--disabled {
    opacity: 0.42;
    cursor: not-allowed;
    color: var(--color-brand);
  }

  .button__blobs {
    height: 100%;
    filter: url(#goo);
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    bottom: -3px;
    right: -1px;
    z-index: -1;
    border-radius: 18px;
    pointer-events: none;
  }

  .button__blobs span {
    background-color: var(--color-brand);
    width: 34%;
    height: 100%;
    border-radius: 100%;
    position: absolute;
    transform: scale(1.4) translateY(125%) translateZ(0);
    transition: all 700ms ease;
    display: block;
  }

  .button__blobs span:nth-child(1) {
    left: -5%;
  }

  .button__blobs span:nth-child(2) {
    left: 30%;
    transition-delay: 60ms;
  }

  .button__blobs span:nth-child(3) {
    left: 66%;
    transition-delay: 25ms;
  }
</style>
