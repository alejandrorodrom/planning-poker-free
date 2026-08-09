<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import TeamList from '$lib/components/TeamList.svelte';
  import { t } from '$lib/i18n';
  import type { PlayerPublic, Team } from '$lib/room/protocol';

  type Props = {
    open: boolean;
    teams: Team[];
    players: PlayerPublic[];
    creatable?: boolean;
    oncreate?: (name: string) => void;
    onrename?: (teamId: string, name: string) => void;
    ondelete?: (teamId: string) => void;
    onclose: () => void;
  };

  let {
    open,
    teams,
    players,
    creatable = false,
    oncreate,
    onrename,
    ondelete,
    onclose
  }: Props = $props();

  const description = $derived(
    teams.length === 0
      ? t('teams.emptyDesc')
      : teams.length === 1
        ? t('teams.countOne')
        : t('teams.countMany', { count: teams.length })
  );
</script>

<ModalShell
  {open}
  title={t('teams.title')}
  titleId="teams-modal-title"
  eyebrow={t('moderation.eyebrow')}
  {description}
  hint={creatable ? t('teams.hint') : undefined}
  size="lg"
  {onclose}
>
  <TeamList
    {teams}
    {players}
    title=""
    hint=""
    emptyLabel={creatable ? t('teams.emptyManage') : t('teams.emptyWait')}
    {creatable}
    manageable={creatable}
    autofocusCreate={open && creatable}
    {oncreate}
    {onrename}
    {ondelete}
  />

  {#snippet footer()}
    <LiquidButton text={t('common.close')} onclick={onclose} />
  {/snippet}
</ModalShell>
