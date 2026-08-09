<script lang="ts">
  import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
  import {
    ACCESSORIES_COLORS,
    AVATAR_ACCESSORIES,
    AVATAR_CLOTHES,
    AVATAR_CLOTHES_GRAPHICS,
    AVATAR_COSTUMES,
    AVATAR_EYEBROWS,
    AVATAR_EYES,
    AVATAR_FACIAL_HAIR,
    AVATAR_MOUTHS,
    AVATAR_TOPS,
    CLOTHES_COLORS,
    DEFAULT_AVATAR,
    FACIAL_HAIR_COLORS,
    HAT_COLORS,
    HAIR_COLORS,
    SKIN_COLORS,
    isCostumeTop,
    randomAvatar,
    type AvatarOption,
    type PlayerAvatarConfig
  } from '$lib/room/avatar';
  import { createAvatarDataUri } from '$lib/room/dicebearAvatar';
  import { t } from '$lib/i18n';

  type Props = {
    value?: PlayerAvatarConfig;
    compact?: boolean;
  };

  type TabId = 'style' | 'face' | 'clothes' | 'costumes' | 'colors';

  const tabs = $derived([
    { id: 'style' as const, label: t('avatar.tabStyle') },
    { id: 'face' as const, label: t('avatar.tabFace') },
    { id: 'clothes' as const, label: t('avatar.tabClothes') },
    { id: 'costumes' as const, label: t('avatar.tabCostumes') },
    { id: 'colors' as const, label: t('avatar.tabColors') }
  ]);

  let { value = $bindable({ ...DEFAULT_AVATAR }), compact = false }: Props = $props();

  let tab = $state<TabId>('style');
  let lastHair = $state(isCostumeTop(value.top) ? DEFAULT_AVATAR.top : value.top);

  const showHatColor = $derived(isCostumeTop(value.top));
  const showFacialHairColor = $derived(value.facialHair !== 'none');
  const showAccessoriesColor = $derived(value.accessories !== 'none');
  const showGraphic = $derived(value.clothes === 'graphicShirt');

  $effect(() => {
    if (!isCostumeTop(value.top)) lastHair = value.top;
  });

  function patch(partial: Partial<PlayerAvatarConfig>) {
    value = { ...value, ...partial };
  }

  function setCostume(id: string) {
    if (id === 'none') {
      patch({ top: lastHair || DEFAULT_AVATAR.top });
      return;
    }
    patch({ top: id });
  }

  function thumb(partial: Partial<PlayerAvatarConfig>): string {
    return createAvatarDataUri({ ...value, ...partial }, 72);
  }

  function accessoryThumb(id: string): string {
    return createAvatarDataUri(
      {
        ...value,
        accessories: id,
        accessoriesColor: id === 'none' ? value.accessoriesColor : '#262e33'
      },
      72
    );
  }

  function thumbs(
    options: AvatarOption[],
    key: keyof PlayerAvatarConfig
  ): { id: string; label: string; src: string; active: boolean }[] {
    return options.map((option) => ({
      id: option.id,
      label: option.label,
      src: thumb({ [key]: option.id }),
      active: value[key] === option.id
    }));
  }

  const styleThumbs = $derived(tab === 'style' ? thumbs(AVATAR_TOPS, 'top') : []);
  const eyesThumbs = $derived(tab === 'face' ? thumbs(AVATAR_EYES, 'eyes') : []);
  const browsThumbs = $derived(tab === 'face' ? thumbs(AVATAR_EYEBROWS, 'eyebrows') : []);
  const mouthThumbs = $derived(tab === 'face' ? thumbs(AVATAR_MOUTHS, 'mouth') : []);
  const facialThumbs = $derived(tab === 'face' ? thumbs(AVATAR_FACIAL_HAIR, 'facialHair') : []);
  const clothesThumbs = $derived(tab === 'clothes' ? thumbs(AVATAR_CLOTHES, 'clothes') : []);
  const graphicThumbs = $derived(
    tab === 'clothes' && showGraphic ? thumbs(AVATAR_CLOTHES_GRAPHICS, 'clothesGraphic') : []
  );
  const costumeThumbs = $derived.by(() => {
    if (tab !== 'costumes') return [];
    return AVATAR_COSTUMES.map((option) => {
      const previewTop = option.id === 'none' ? lastHair || DEFAULT_AVATAR.top : option.id;
      return {
        id: option.id,
        label: option.label,
        src: thumb({ top: previewTop }),
        active: option.id === 'none' ? !isCostumeTop(value.top) : value.top === option.id
      };
    });
  });
  const accessoriesThumbs = $derived.by(() => {
    if (tab !== 'costumes') return [];
    return AVATAR_ACCESSORIES.map((option) => ({
      id: option.id,
      label: option.label,
      src: accessoryThumb(option.id),
      active: value.accessories === option.id
    }));
  });
</script>

<div class="picker" class:picker--compact={compact}>
  <div class="picker__side">
    <div class="picker__preview">
      <PlayerAvatar avatar={value} size={compact ? 96 : 120} />
    </div>
    <button type="button" class="random" onclick={() => (value = randomAvatar())}>
      {t('avatar.random')}
    </button>
  </div>

  <div class="picker__main">
    <div class="tabs" role="tablist" aria-label={t('avatar.categories')}>
      {#each tabs as item (item.id)}
        <button
          type="button"
          class="tab"
          role="tab"
          aria-selected={tab === item.id}
          class:tab--active={tab === item.id}
          onclick={() => (tab = item.id)}
        >
          {item.label}
        </button>
      {/each}
    </div>

    <div class="panel" role="tabpanel">
      {#if tab === 'style'}
        <div class="gallery">
          {#each styleThumbs as option (option.id)}
            <button
              type="button"
              class="tile"
              class:tile--active={option.active}
              aria-label={option.label}
              title={option.label}
              onclick={() => patch({ top: option.id })}
            >
              <img src={option.src} alt="" width="56" height="56" draggable="false" />
            </button>
          {/each}
        </div>
      {:else if tab === 'face'}
        <section class="section">
          <h3 class="section__label">{t('avatar.eyes')}</h3>
          <div class="gallery gallery--sm">
            {#each eyesThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ eyes: option.id })}
              >
                <img src={option.src} alt="" width="48" height="48" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
        <section class="section">
          <h3 class="section__label">{t('avatar.eyebrows')}</h3>
          <div class="gallery gallery--sm">
            {#each browsThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ eyebrows: option.id })}
              >
                <img src={option.src} alt="" width="48" height="48" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
        <section class="section">
          <h3 class="section__label">{t('avatar.mouth')}</h3>
          <div class="gallery gallery--sm">
            {#each mouthThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ mouth: option.id })}
              >
                <img src={option.src} alt="" width="48" height="48" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
        <section class="section">
          <h3 class="section__label">{t('avatar.facialHair')}</h3>
          <div class="gallery gallery--sm">
            {#each facialThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ facialHair: option.id })}
              >
                <img src={option.src} alt="" width="48" height="48" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
      {:else if tab === 'clothes'}
        <section class="section">
          <h3 class="section__label">{t('avatar.clothes')}</h3>
          <div class="gallery">
            {#each clothesThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ clothes: option.id })}
              >
                <img src={option.src} alt="" width="56" height="56" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
        {#if showGraphic}
          <section class="section">
            <h3 class="section__label">{t('avatar.graphic')}</h3>
            <div class="gallery gallery--sm">
              {#each graphicThumbs as option (option.id)}
                <button
                  type="button"
                  class="tile"
                  class:tile--active={option.active}
                  aria-label={option.label}
                  title={option.label}
                  onclick={() => patch({ clothesGraphic: option.id })}
                >
                  <img src={option.src} alt="" width="48" height="48" draggable="false" />
                </button>
              {/each}
            </div>
          </section>
        {/if}
      {:else if tab === 'costumes'}
        <section class="section">
          <h3 class="section__label">{t('avatar.glasses')}</h3>
          <div class="gallery">
            {#each accessoriesThumbs as option (option.id)}
              <button
                type="button"
                class="tile tile--labeled"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => patch({ accessories: option.id })}
              >
                <img src={option.src} alt="" width="56" height="56" draggable="false" />
                <span class="tile__label">{option.label}</span>
              </button>
            {/each}
          </div>
        </section>
        <section class="section">
          <h3 class="section__label">{t('avatar.head')}</h3>
          <div class="gallery">
            {#each costumeThumbs as option (option.id)}
              <button
                type="button"
                class="tile"
                class:tile--active={option.active}
                aria-label={option.label}
                title={option.label}
                onclick={() => setCostume(option.id)}
              >
                <img src={option.src} alt="" width="56" height="56" draggable="false" />
              </button>
            {/each}
          </div>
        </section>
      {:else}
        <section class="section">
          <h3 class="section__label">{showHatColor ? t('avatar.hat') : t('avatar.hair')}</h3>
          <div class="swatches">
            {#each (showHatColor ? HAT_COLORS : HAIR_COLORS) as color (color.id)}
              <button
                type="button"
                class="swatch"
                class:swatch--active={showHatColor
                  ? value.hatColor === color.id
                  : value.hairColor === color.id}
                class:swatch--light={color.id === '#ffffff' ||
                  color.id === '#ffffb1' ||
                  color.id === '#e6e6e6'}
                style={`--swatch: ${color.id}`}
                aria-label={color.label}
                title={color.label}
                onclick={() =>
                  showHatColor
                    ? patch({ hatColor: color.id })
                    : patch({ hairColor: color.id, facialHairColor: color.id })}
              ></button>
            {/each}
          </div>
        </section>

        {#if showHatColor}
          <section class="section">
            <h3 class="section__label">{t('avatar.hair')}</h3>
            <div class="swatches">
              {#each HAIR_COLORS as color (color.id)}
                <button
                  type="button"
                  class="swatch"
                  class:swatch--active={value.hairColor === color.id}
                  style={`--swatch: ${color.id}`}
                  aria-label={color.label}
                  title={color.label}
                  onclick={() => patch({ hairColor: color.id, facialHairColor: color.id })}
                ></button>
              {/each}
            </div>
          </section>
        {/if}

        {#if showFacialHairColor}
          <section class="section">
            <h3 class="section__label">{t('avatar.beard')}</h3>
            <div class="swatches">
              {#each FACIAL_HAIR_COLORS as color (color.id)}
                <button
                  type="button"
                  class="swatch"
                  class:swatch--active={value.facialHairColor === color.id}
                  style={`--swatch: ${color.id}`}
                  aria-label={color.label}
                  title={color.label}
                  onclick={() => patch({ facialHairColor: color.id })}
                ></button>
              {/each}
            </div>
          </section>
        {/if}

        <section class="section">
          <h3 class="section__label">{t('avatar.clothes')}</h3>
          <div class="swatches">
            {#each CLOTHES_COLORS as color (color.id)}
              <button
                type="button"
                class="swatch"
                class:swatch--active={value.clothesColor === color.id}
                class:swatch--light={color.id === '#ffffff' ||
                  color.id === '#ffffb1' ||
                  color.id === '#e6e6e6'}
                style={`--swatch: ${color.id}`}
                aria-label={color.label}
                title={color.label}
                onclick={() => patch({ clothesColor: color.id })}
              ></button>
            {/each}
          </div>
        </section>

        {#if showAccessoriesColor}
          <section class="section">
            <h3 class="section__label">{t('avatar.accessory')}</h3>
            <div class="swatches">
              {#each ACCESSORIES_COLORS as color (color.id)}
                <button
                  type="button"
                  class="swatch"
                  class:swatch--active={value.accessoriesColor === color.id}
                  class:swatch--light={color.id === '#ffffff' ||
                    color.id === '#ffffb1' ||
                    color.id === '#e6e6e6'}
                  style={`--swatch: ${color.id}`}
                  aria-label={color.label}
                  title={color.label}
                  onclick={() => patch({ accessoriesColor: color.id })}
                ></button>
              {/each}
            </div>
          </section>
        {/if}

        <section class="section">
          <h3 class="section__label">{t('avatar.skin')}</h3>
          <div class="swatches">
            {#each SKIN_COLORS as color (color.id)}
              <button
                type="button"
                class="swatch"
                class:swatch--active={value.skinColor === color.id}
                style={`--swatch: ${color.id}`}
                aria-label={color.label}
                title={color.label}
                onclick={() => patch({ skinColor: color.id })}
              ></button>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </div>
</div>

<style>
  .picker {
    display: grid;
    gap: 16px;
    width: 100%;
  }

  .picker--compact {
    gap: 12px;
  }

  @media (min-width: 720px) {
    .picker:not(.picker--compact) {
      grid-template-columns: 140px 1fr;
      gap: 20px 24px;
      align-items: start;
    }

    .picker:not(.picker--compact) .picker__side {
      position: sticky;
      top: 0;
    }
  }

  .picker__side {
    display: grid;
    gap: 10px;
    justify-items: center;
  }

  .picker__preview {
    display: grid;
    place-items: center;
    width: 132px;
    height: 132px;
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.9), transparent 55%),
      linear-gradient(160deg, rgba(33, 172, 195, 0.14), rgba(22, 93, 112, 0.08));
    border: 1px solid rgba(22, 93, 112, 0.12);
  }

  .picker--compact .picker__preview {
    width: 108px;
    height: 108px;
    border-radius: 22px;
  }

  .random {
    border: 1px solid rgba(22, 93, 112, 0.22);
    background: rgba(255, 255, 255, 0.9);
    color: #0b3d4a;
    border-radius: 999px;
    padding: 0.4rem 0.95rem;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;
  }

  .random:hover {
    border-color: var(--color-brand);
    color: var(--color-brand);
  }

  .picker__main {
    min-width: 0;
    display: grid;
    gap: 12px;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    position: sticky;
    top: 0;
    z-index: 1;
    padding-bottom: 4px;
    background: #f7fbfc;
  }

  .tab {
    border: 1px solid transparent;
    background: transparent;
    color: #5a7a82;
    border-radius: 999px;
    padding: 0.4rem 0.85rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 800;
    cursor: pointer;
  }

  .tab--active {
    border-color: rgba(22, 93, 112, 0.18);
    background: #fff;
    color: #0b3d4a;
    box-shadow: 0 1px 0 rgba(22, 93, 112, 0.06);
  }

  .panel {
    display: grid;
    gap: 14px;
  }

  .section {
    display: grid;
    gap: 8px;
  }

  .section__label {
    margin: 0;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5a7a82;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 8px;
  }

  .gallery--sm {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  }

  .tile {
    display: grid;
    place-items: center;
    aspect-ratio: 1;
    padding: 2px;
    border-radius: 14px;
    border: 2px solid rgba(22, 93, 112, 0.12);
    background: rgba(255, 255, 255, 0.85);
    cursor: pointer;
  }

  .tile--labeled {
    aspect-ratio: auto;
    grid-template-rows: 1fr auto;
    gap: 2px;
    padding: 4px 4px 6px;
  }

  .tile__label {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    line-height: 1.15;
    color: #3d5f68;
    text-align: center;
  }

  .tile img {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 10px;
    pointer-events: none;
  }

  .tile--active {
    border-color: var(--color-brand);
    box-shadow: 0 0 0 2px rgba(33, 172, 195, 0.2);
  }

  .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .swatch {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.9);
    background: var(--swatch);
    box-shadow: 0 0 0 1px rgba(22, 93, 112, 0.25);
    cursor: pointer;
    padding: 0;
  }

  .swatch--light {
    box-shadow:
      0 0 0 1px rgba(22, 93, 112, 0.35),
      inset 0 0 0 1px rgba(22, 93, 112, 0.08);
  }

  .swatch--active {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px var(--color-brand);
  }
</style>
