<script lang="ts">
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModalShell from '$lib/components/ModalShell.svelte';
  import TeamList from '$lib/components/TeamList.svelte';
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
</script>

<ModalShell
  {open}
  title="Equipos"
  titleId="teams-modal-title"
  eyebrow="Sala"
  description="Opcional. Úsalos para limitar quién vota en cada ronda."
  hint={creatable ? 'Crea equipos y asígnalos desde Participantes.' : undefined}
  size="md"
  {onclose}
>
  <TeamList
    {teams}
    {players}
    title=""
    hint=""
    {creatable}
    manageable={creatable}
    {oncreate}
    {onrename}
    {ondelete}
  />

  {#snippet footer()}
    <LiquidButton text="Cerrar" onclick={onclose} />
  {/snippet}
</ModalShell>
