<script lang="ts">
  import LiquidButton from './LiquidButton.svelte';
  import RoomNotice from './RoomNotice.svelte';
  import { t } from '$lib/i18n';

  type Props = {
    reason?: string;
  };

  let { reason = 'not_found' }: Props = $props();

  const copy = $derived.by(() => {
    switch (reason) {
      case 'idle':
        return {
          title: t('roomGone.idleTitle'),
          description: t('roomGone.idleDesc')
        };
      case 'expired':
        return {
          title: t('roomGone.expiredTitle'),
          description: t('roomGone.expiredDesc')
        };
      case 'host':
        return {
          title: t('roomGone.hostTitle'),
          description: t('roomGone.hostDesc')
        };
      default:
        return {
          title: t('roomGone.defaultTitle'),
          description: t('roomGone.defaultDesc')
        };
    }
  });
</script>

<RoomNotice title={copy.title} description={copy.description}>
  <LiquidButton text={t('roomGone.createNewRoom')} href="/" />
  <a class="gone__link" href="/">{t('common.backToHome')}</a>
</RoomNotice>

<style>
  .gone__link {
    font-family: var(--font-body);
    font-weight: 600;
    color: var(--color-brand);
    text-decoration: none;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .gone__link:hover {
    text-decoration: underline;
  }
</style>
