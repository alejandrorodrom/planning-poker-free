<script lang="ts">
  import {
    DEFAULT_AVATAR,
    sanitizeAvatar,
    type PlayerAvatarConfig
  } from '$lib/room/avatar';
  import { createAvatarDataUri } from '$lib/room/dicebearAvatar';

  type Props = {
    avatar?: PlayerAvatarConfig | null;
    size?: number;
    class?: string;
  };

  let { avatar = null, size = 40, class: className = '' }: Props = $props();

  const config = $derived(sanitizeAvatar(avatar ?? DEFAULT_AVATAR));
  const src = $derived(createAvatarDataUri(config, Math.max(64, size * 2)));
</script>

<img
  class="avatar {className}"
  {src}
  width={size}
  height={size}
  alt=""
  aria-hidden="true"
  draggable="false"
/>

<style>
  .avatar {
    display: block;
    flex-shrink: 0;
    border-radius: 18%;
    background: rgba(255, 255, 255, 0.55);
    object-fit: cover;
  }
</style>
