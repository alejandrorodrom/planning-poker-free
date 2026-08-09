<script lang="ts">
  import { untrack } from 'svelte';
  import AvatarPicker from '$lib/components/AvatarPicker.svelte';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import { t } from '$lib/i18n';
  import { sanitizeAvatar, type PlayerAvatarConfig } from '$lib/room/avatar';

  type Props = {
    open: boolean;
    avatar: PlayerAvatarConfig;
    onsave: (avatar: PlayerAvatarConfig) => void;
    onclose: () => void;
  };

  let { open, avatar, onsave, onclose }: Props = $props();

  let draft = $state(untrack(() => sanitizeAvatar(avatar)));

  $effect(() => {
    if (open) draft = sanitizeAvatar(avatar);
  });
</script>

<ModalShell
  {open}
  title={t('avatar.title')}
  titleId="avatar-modal-title"
  eyebrow={t('avatar.eyebrow')}
  description={t('avatar.description')}
  size="xl"
  variant="soft"
  centered
  {onclose}
>
  <AvatarPicker bind:value={draft} />

  {#snippet footer()}
    <button type="button" class="ghost" onclick={onclose}>{t('common.cancel')}</button>
    <LiquidButton
      text={t('common.save')}
      onclick={() => {
        onsave(sanitizeAvatar(draft));
        onclose();
      }}
    />
  {/snippet}
</ModalShell>

<style>
  .ghost {
    border: 0;
    background: none;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 700;
    color: #4a6a72;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
