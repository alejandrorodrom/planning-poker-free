<script lang="ts">
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

  const description = $derived(
    teams.length === 0
      ? 'Opcional. Úsalos para limitar quién vota en cada ronda.'
      : `${teams.length} ${teams.length === 1 ? 'equipo' : 'equipos'} en la sala.`
  );
</script>

<ModalShell
  {open}
  title="Equipos"
  titleId="teams-modal-title"
  eyebrow="Sala"
  {description}
  hint={creatable ? 'Crea equipos y asígnalos desde Participantes.' : undefined}
  size="lg"
  {onclose}
>
  <TeamList
    {teams}
    {players}
    title=""
    hint=""
    emptyLabel={creatable
      ? 'Añade el primer equipo para agrupar participantes.'
      : 'Todavía no hay equipos.'}
    {creatable}
    manageable={creatable}
    autofocusCreate={open && creatable}
    {oncreate}
    {onrename}
    {ondelete}
  />

  {#snippet footer()}
    <button type="button" class="modal-ghost" onclick={onclose}>Cerrar</button>
  {/snippet}
</ModalShell>
