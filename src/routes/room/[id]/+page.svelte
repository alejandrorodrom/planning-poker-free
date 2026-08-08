<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { onDestroy, onMount } from 'svelte';
  import AvatarModal from '$lib/components/AvatarModal.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';
  import InviteModal from '$lib/components/InviteModal.svelte';
  import JoinRoomForm from '$lib/components/JoinRoomForm.svelte';
  import LiquidButton from '$lib/components/LiquidButton.svelte';
  import ModerationModal from '$lib/components/ModerationModal.svelte';
  import PlayersModal from '$lib/components/PlayersModal.svelte';
  import ResultsModal from '$lib/components/ResultsModal.svelte';
  import RoomGone from '$lib/components/RoomGone.svelte';
  import RoomNotice from '$lib/components/RoomNotice.svelte';
  import RoomTopbar from '$lib/components/RoomTopbar.svelte';
  import RoundArena from '$lib/components/RoundArena.svelte';
  import StoriesModal from '$lib/components/StoriesModal.svelte';
  import TeamsModal from '$lib/components/TeamsModal.svelte';
  import { loadStoredAvatar, saveStoredAvatar, type PlayerAvatarConfig } from '$lib/room/avatar';
  import { canCastVote } from '$lib/room/audience';
  import { RoomClient } from '$lib/room/client';
  import { DECKS } from '$lib/room/decks';
  import type { Audience, ClientToServer, PlayerRole, RoomPublicState } from '$lib/room/protocol';
  import { storiesToCsv, storiesToMarkdown } from '$lib/room/resultsFormat';
  import { MODERATOR_LABEL, sanitizeRoleLabel } from '$lib/room/roleLabel';
  import { clearSession, loadSession, saveSession } from '$lib/room/session';

  const roomId = $derived(page.params.id ?? '');

  let client: RoomClient | null = null;
  let roomState = $state<RoomPublicState | null>(null);
  let playerId = $state<string | null>(null);
  let connection = $state<'connecting' | 'open' | 'closed'>('connecting');
  let error = $state('');
  let goneReason = $state<string | null>(null);
  let sessionTaken = $state(false);
  let removed = $state(false);

  let needsJoin = $state(false);
  let joinName = $state('');
  let joinPassword = $state('');
  let joinRole = $state<PlayerRole>('voter');
  let joinRoleLabel = $state('');
  let joinTeamId = $state<string>('');
  let joinAvatar = $state<PlayerAvatarConfig>(loadStoredAvatar());
  let avatarOpen = $state(false);
  let roomMeta = $state<{
    name?: string;
    isPrivate: boolean;
    teams: { id: string; name: string }[];
  } | null>(null);

  let storyTitle = $state('');
  let closeEstimate = $state('');
  let timerSeconds = $state(60);
  let useRoundTimer = $state(true);
  let audienceMode = $state<'all' | 'teams'>('all');
  let audienceTeamIds = $state<string[]>([]);
  let transferTargetId = $state('');
  let roundStoryId = $state('');
  let now = $state(Date.now());
  let tick: ReturnType<typeof setInterval> | undefined;
  let confirmDialog = $state<
    null | 'cancel_round' | 'close_room' | 'remove_player' | 'leave' | 'delete_story' | 'delete_team'
  >(null);
  let removeTarget = $state<{ id: string; name: string } | null>(null);
  let deleteStoryTarget = $state<{ id: string; title: string } | null>(null);
  let deleteTeamTarget = $state<{ id: string; name: string } | null>(null);
  let leftRoom = $state(false);
  let rejoinRetries = $state(0);
  let editingRoomName = $state(false);
  let draftRoomName = $state('');
  let inviteOpen = $state(false);
  let resultsOpen = $state(false);
  let playersOpen = $state(false);
  let teamsOpen = $state(false);
  let storiesOpen = $state(false);
  let moderationOpen = $state(false);

  const me = $derived(roomState?.players.find((p) => p.id === playerId));
  const isSm = $derived(Boolean(me?.isScrumMaster));
  const meRoleLabel = $derived.by(() => {
    if (!me) return '';
    if (isSm) return MODERATOR_LABEL;
    return sanitizeRoleLabel(me.roleLabel);
  });
  const deck = $derived(roomState ? DECKS[roomState.deck] : null);
  const activeStory = $derived(
    roomState?.stories.find((s) => s.id === (roundStoryId || roomState?.activeStoryId))
  );
  const smOffline = $derived.by(() => {
    const current = roomState;
    if (!current?.scrumMasterPlayerId) return true;
    const sm = current.players.find((p) => p.id === current.scrumMasterPlayerId);
    return !sm || sm.connection === 'offline';
  });
  const canClaim = $derived.by(() => {
    if (!roomState || isSm) return false;
    if (!roomState.scrumMasterPlayerId) return true;
    return smOffline;
  });
  const showSmBanner = $derived(!isSm && (smOffline || !roomState?.scrumMasterPlayerId));
  const otherConnectedCount = $derived(
    roomState?.players.filter((p) => p.id !== playerId && p.connection === 'connected').length ?? 0
  );
  const leaveConfirmCopy = $derived.by(() => {
    if (isSm && otherConnectedCount > 0) {
      return {
        title: 'Abandonar sala',
        description: `Saldrás de la sesión. El rol de ${MODERATOR_LABEL} pasará a otra persona conectada. Si quieres cerrar la sala para todos, usa Finalizar sala.`,
        confirmLabel: 'Abandonar'
      };
    }
    if (isSm) {
      return {
        title: 'Abandonar sala',
        description:
          'Saldrás de la sesión. La sala quedará vacía y se cerrará por inactividad si nadie entra.',
        confirmLabel: 'Abandonar'
      };
    }
    return {
      title: 'Abandonar sala',
      description: 'Saldrás de la sesión. Podrás volver a unirte con el link si te invitan de nuevo.',
      confirmLabel: 'Abandonar'
    };
  });
  const timerLeftSeconds = $derived.by(() => {
    const timer = roomState?.activeRound?.timer;
    if (!timer || timer.status === 'cancelled') return null;
    if (timer.status === 'finished') return 0;
    return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
  });
  const timerLabel = $derived.by(() => {
    const timer = roomState?.activeRound?.timer;
    if (!timer) return null;
    if (timer.status === 'cancelled') return 'Cancelado';
    if (timer.status === 'finished') return '0:00';
    if (timerLeftSeconds == null) return null;
    const m = Math.floor(timerLeftSeconds / 60);
    const s = timerLeftSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  });
  const timerProgress = $derived.by(() => {
    const timer = roomState?.activeRound?.timer;
    if (!timer || !timer.durationSeconds) return null;
    if (timer.status === 'cancelled') return null;
    if (timer.status === 'finished') return 0;
    if (timerLeftSeconds == null) return null;
    return Math.min(1, Math.max(0, timerLeftSeconds / timer.durationSeconds));
  });
  const timerUrgent = $derived(
    timerLeftSeconds != null && timerLeftSeconds <= 10 && Boolean(roomState?.activeRound?.timer)
  );
  const eligibleToVote = $derived.by(() => {
    if (!roomState?.activeRound || !me) return false;
    return canCastVote(me, roomState.activeRound, { requireConnected: true });
  });

  const votingTeamNames = $derived.by(() => {
    const current = roomState;
    const audience = current?.activeRound?.audience;
    if (!audience || audience.type !== 'teams' || !current) return [];
    return audience.teamIds
      .map((id) => current.teams.find((team) => team.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  });

  const voteStatusMessage = $derived.by(() => {
    if (!roomState?.activeRound || !me || eligibleToVote) return null;
    if (roomState.activeRound.revealed) {
      return `Las cartas ya se revelaron. Espera a que el ${MODERATOR_LABEL} cierre o vuelva a abrir la votación.`;
    }
    if (me.role === 'observer') {
      if (votingTeamNames.length) {
        return `Estás observando. Ahora votan: ${formatTeamList(votingTeamNames)}.`;
      }
      return 'Estás observando esta ronda. No emites carta.';
    }
    if (roomState.activeRound.audience.type === 'teams') {
      if (votingTeamNames.length) {
        return `Esta ronda la votan ${formatTeamList(votingTeamNames)}.`;
      }
      return 'Esta ronda es solo para algunos equipos.';
    }
    return 'Ahora mismo no puedes votar en esta ronda.';
  });

  function formatTeamList(names: string[]): string {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0]!;
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;
  }

  function send(message: ClientToServer) {
    if (error) error = '';
    client?.send(message);
  }

  $effect(() => {
    if (!error) return;

    if (error === 'Elige un nombre' && joinName.trim()) {
      error = '';
      return;
    }
    if (error === 'Elige la historia a votar' && (roundStoryId || roomState?.activeStoryId)) {
      error = '';
      return;
    }
    if (error === 'El nombre de la sala no puede estar vacío' && draftRoomName.trim()) {
      error = '';
      return;
    }
    if (error === `Elige a quién ceder el rol de ${MODERATOR_LABEL}` && transferTargetId) {
      error = '';
      return;
    }
    if (
      (error === 'Elige la estimación de consenso' || error === 'No hay estimación para guardar') &&
      closeEstimate
    ) {
      error = '';
    }
  });

  onMount(() => {
    tick = setInterval(() => {
      now = Date.now();
    }, 250);
    void bootstrap();
  });

  onDestroy(() => {
    if (tick) clearInterval(tick);
    client?.close();
  });

  async function bootstrap() {
    goneReason = null;
    sessionTaken = false;
    error = '';

    const hasSession = Boolean(loadSession(roomId));
    const maxAttempts = hasSession ? 8 : 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await fetch(`/api/room/${roomId}`);
        const data = (await res.json()) as {
          ok?: boolean;
          reason?: string;
          name?: string;
          isPrivate?: boolean;
          teams?: { id: string; name: string }[];
        };

        if (data.ok) {
          roomMeta = {
            name: data.name,
            isPrivate: Boolean(data.isPrivate),
            teams: data.teams ?? []
          };
          connectSocket();
          return;
        }

        if (hasSession && attempt < maxAttempts - 1) {
          await sleep(400 * (attempt + 1));
          continue;
        }

        clearSession(roomId);
        goneReason = data.reason ?? 'not_found';
        return;
      } catch {
        if (attempt < maxAttempts - 1) {
          await sleep(400 * (attempt + 1));
          continue;
        }

        if (hasSession) {
          connectSocket();
          return;
        }

        goneReason = 'not_found';
      }
    }
  }

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  function connectSocket() {
    client?.close();
    client = new RoomClient(roomId, {
      onSync(next, you) {
        roomState = next;
        if (you) {
          playerId = you.playerId;
          rejoinRetries = 0;
          saveSession({
            roomId,
            playerId: you.playerId,
            token: you.token,
            name: next.players.find((p) => p.id === you.playerId)?.name ?? joinName
          });
          needsJoin = false;
        }
        if (next.defaultTimerSeconds) {
          timerSeconds = next.defaultTimerSeconds;
          useRoundTimer = true;
        } else if (next.defaultTimerSeconds === null) {
          useRoundTimer = false;
        }
        if (next.teams) {
          roomMeta = { name: next.name, isPrivate: next.isPrivate, teams: next.teams };
        }
        if (next.activeStoryId) {
          roundStoryId = next.activeStoryId;
        } else if (!next.stories.some((s) => s.id === roundStoryId)) {
          roundStoryId =
            next.stories.find((s) => s.status === 'pending' || s.status === 'voting')?.id ??
            next.stories[0]?.id ??
            '';
        }
      },
      onError(message, code) {
        error = message;
        if (code === 'session_invalid') {
          const session = loadSession(roomId);
          if (session && rejoinRetries < 3) {
            rejoinRetries += 1;
            window.setTimeout(() => {
              if (leftRoom || !client) return;
              const current = loadSession(roomId);
              if (!current) return;
              client.send({
                type: 'rejoin',
                playerId: current.playerId,
                token: current.token
              });
            }, 400 * rejoinRetries);
            return;
          }
          clearSession(roomId);
          rejoinRetries = 0;
          needsJoin = true;
        }
      },
      onSessionTaken() {
        sessionTaken = true;
        client?.close();
      },
      onRemoved() {
        clearSession(roomId);
        removed = true;
        client?.close();
      },
      onRoomClosed(reason) {
        clearSession(roomId);
        goneReason = reason;
        client?.close();
      },
      onConnectionChange(status) {
        if (leftRoom) return;
        connection = status;
        if (status === 'open') {
          const session = loadSession(roomId);
          if (session) {
            client?.send({ type: 'rejoin', playerId: session.playerId, token: session.token });
            needsJoin = false;
            if (joinName.trim() === '') joinName = session.name;
          } else {
            needsJoin = true;
          }
        }
      }
    });
    client.connect();
  }

  function submitJoin() {
    const name = joinName.trim();
    if (!name) {
      error = 'Elige un nombre';
      return;
    }
    saveStoredAvatar(joinAvatar);
    send({
      type: 'join',
      name,
      password: roomMeta?.isPrivate ? joinPassword : undefined,
      role: joinRole,
      roleLabel: sanitizeRoleLabel(joinRoleLabel),
      teamId: joinTeamId || null,
      avatar: joinAvatar
    });
  }

  function sendVote(value: string) {
    send({ type: 'vote', value });
  }

  function createStory() {
    const title = storyTitle.trim();
    if (!title) return;
    send({ type: 'create_story', title });
    storyTitle = '';
  }

  function updateStory(storyId: string, title: string) {
    send({ type: 'update_story', storyId, title });
  }

  function requestDeleteStory(storyId: string) {
    const story = roomState?.stories.find((s) => s.id === storyId);
    if (!story) return;
    deleteStoryTarget = { id: story.id, title: story.title };
    confirmDialog = 'delete_story';
  }

  function requestDeleteTeam(teamId: string) {
    const team = roomState?.teams.find((t) => t.id === teamId);
    if (!team) return;
    deleteTeamTarget = { id: team.id, name: team.name };
    confirmDialog = 'delete_team';
  }

  function startRound() {
    const storyId = roundStoryId || roomState?.activeStoryId;
    if (!storyId) {
      error = 'Elige la historia a votar';
      storiesOpen = true;
      return;
    }
    const audience: Audience =
      audienceMode === 'teams' && audienceTeamIds.length
        ? { type: 'teams', teamIds: audienceTeamIds }
        : { type: 'all_voters' };
    send({ type: 'select_story', storyId });
    send({
      type: 'start_round',
      storyId,
      audience,
      timerSeconds: useRoundTimer ? timerSeconds : null
    });
  }

  function closeVoting() {
    send({
      type: 'close_voting',
      estimate:
        roomState?.estimateRule === 'consensus'
          ? closeEstimate || undefined
          : roomState?.activeRound?.suggestedEstimate
    });
  }

  function revote() {
    send({
      type: 'revote',
      timerSeconds: useRoundTimer ? timerSeconds : null
    });
  }

  function copyResults(format: 'md' | 'csv') {
    if (!roomState) return;
    const text = format === 'md' ? storiesToMarkdown(roomState.stories) : storiesToCsv(roomState.stories);
    void navigator.clipboard.writeText(text);
  }

  function finalizeRoom() {
    confirmDialog = 'close_room';
  }

  function requestCancelRound() {
    confirmDialog = 'cancel_round';
  }

  function dismissConfirm() {
    confirmDialog = null;
    removeTarget = null;
    deleteStoryTarget = null;
    deleteTeamTarget = null;
  }

  function acceptConfirm() {
    if (confirmDialog === 'cancel_round') {
      send({ type: 'cancel_timer' });
    } else if (confirmDialog === 'close_room') {
      send({ type: 'close_room' });
    } else if (confirmDialog === 'remove_player' && removeTarget) {
      send({ type: 'remove_player', playerId: removeTarget.id });
    } else if (confirmDialog === 'delete_story' && deleteStoryTarget) {
      const storyId = deleteStoryTarget.id;
      send({ type: 'delete_story', storyId });
      if (roundStoryId === storyId) roundStoryId = '';
    } else if (confirmDialog === 'delete_team' && deleteTeamTarget) {
      const teamId = deleteTeamTarget.id;
      send({ type: 'delete_team', teamId });
      audienceTeamIds = audienceTeamIds.filter((id) => id !== teamId);
    } else if (confirmDialog === 'leave') {
      leaveRoom();
    }
    confirmDialog = null;
    removeTarget = null;
    deleteStoryTarget = null;
    deleteTeamTarget = null;
  }

  function requestRemovePlayer(id: string, name: string) {
    removeTarget = { id, name };
    confirmDialog = 'remove_player';
  }

  function requestLeave() {
    confirmDialog = 'leave';
  }

  function leaveRoom() {
    leftRoom = true;
    client?.send({ type: 'leave' });
    clearSession(roomId);
    client?.close();
    void goto(resolve('/'));
  }

  const roomLink = $derived(`${page.url.origin}/room/${roomId}`);
  const canNativeShare = $derived(
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  );

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(roomLink);
      if (error === 'No se pudo copiar el link') error = '';
      return true;
    } catch {
      error = 'No se pudo copiar el link';
      return false;
    }
  }

  const displayRoomName = $derived(roomState?.name || roomMeta?.name || `Sala ${roomId}`);

  function startEditRoomName() {
    draftRoomName = displayRoomName;
    editingRoomName = true;
  }

  function cancelEditRoomName() {
    editingRoomName = false;
    draftRoomName = '';
  }

  function saveRoomName() {
    const next = draftRoomName.trim();
    if (!next) {
      error = 'El nombre de la sala no puede estar vacío';
      return;
    }
    send({ type: 'update_config', name: next });
    editingRoomName = false;
  }

  async function shareRoomLink() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayRoomName,
          text: `Únete a “${displayRoomName}” en Planning Poker`,
          url: roomLink
        });
        return;
      }
      await copyRoomLink();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      await copyRoomLink();
    }
  }

  function toggleAudienceTeam(id: string) {
    if (audienceTeamIds.includes(id)) {
      audienceTeamIds = audienceTeamIds.filter((t) => t !== id);
    } else {
      audienceTeamIds = [...audienceTeamIds, id];
    }
  }

</script>

<svelte:head>
  <title>{displayRoomName} · Planning Poker</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if goneReason}
  <RoomGone reason={goneReason} />
{:else if sessionTaken}
  <RoomNotice
    title="Sesión abierta en otra pestaña"
    description="Esta pestaña ya no controla tu asiento. Usa la otra o recarga para continuar aquí."
  >
    <LiquidButton text="Reintentar aquí" onclick={() => location.reload()} />
  </RoomNotice>
{:else if removed}
  <RoomNotice
    title="Te quitaron de la sala"
    description={`El ${MODERATOR_LABEL} te removió de esta sesión. Puedes volver al inicio o pedir un nuevo enlace para unirte otra vez.`}
  >
    <LiquidButton text="Volver al inicio" href="/" />
  </RoomNotice>
{:else}
  <section class="room" class:room--arena={!needsJoin && Boolean(roomState)}>
    <RoomTopbar
      roomName={displayRoomName}
      isPrivate={Boolean((roomState ?? roomMeta)?.isPrivate)}
      {isSm}
      {needsJoin}
      editingName={editingRoomName}
      bind:draftName={draftRoomName}
      showInvite={!needsJoin && Boolean(roomState)}
      me={me ? { name: me.name, avatar: me.avatar } : null}
      {meRoleLabel}
      {connection}
      oninvite={() => (inviteOpen = true)}
      oneditAvatar={() => (avatarOpen = true)}
      onstartEditName={startEditRoomName}
      oncancelEditName={cancelEditRoomName}
      onsaveName={saveRoomName}
    />

    {#if error && !needsJoin}
      <div class="toast toast--error" role="alert">{error}</div>
    {/if}

    {#if showSmBanner && canClaim && connection === 'open' && !needsJoin}
      <div class="banner banner--warn">
        <p>
          {!roomState?.scrumMasterPlayerId
            ? `No hay ${MODERATOR_LABEL}. ¿Asumir la moderación?`
            : `El ${MODERATOR_LABEL} no está en la sala. ¿Asumir la moderación?`}
        </p>
        <LiquidButton text="Asumir" onclick={() => send({ type: 'claim_scrum' })} />
      </div>
    {/if}

    {#if needsJoin}
      <JoinRoomForm
        roomName={displayRoomName}
        isPrivate={Boolean(roomMeta?.isPrivate)}
        teams={roomMeta?.teams ?? []}
        {error}
        bind:name={joinName}
        bind:password={joinPassword}
        bind:role={joinRole}
        bind:roleLabel={joinRoleLabel}
        bind:teamId={joinTeamId}
        avatar={joinAvatar}
        onsubmit={submitJoin}
        oneditAvatar={() => (avatarOpen = true)}
        onclearPasswordError={() => (error = '')}
      />

      <AvatarModal
        open={avatarOpen}
        avatar={joinAvatar}
        onsave={(avatar) => {
          saveStoredAvatar(avatar);
          joinAvatar = avatar;
        }}
        onclose={() => (avatarOpen = false)}
      />
    {:else if roomState}
      <div class="game">
        <div class="game__arena">
          <RoundArena
            players={roomState.players}
            teams={roomState.teams}
            meId={playerId}
            round={roomState.activeRound ?? null}
            story={activeStory ?? null}
            deckCards={deck?.cards ?? []}
            {eligibleToVote}
            {voteStatusMessage}
            {timerLabel}
            {timerProgress}
            {timerUrgent}
            {isSm}
            estimateRule={roomState.estimateRule}
            bind:closeEstimate
            bind:audienceMode
            bind:audienceTeamIds
            bind:useRoundTimer
            bind:timerSeconds
            onvote={sendVote}
            onopenStories={() => (storiesOpen = true)}
            ontoggleTeam={toggleAudienceTeam}
            onstart={startRound}
            onreveal={() => send({ type: 'reveal' })}
            oncloseVoting={closeVoting}
            onrevote={revote}
            oncancel={requestCancelRound}
          />
          <div class="arena-fabs">
            <div class="arena-fabs__left">
              {#if isSm}
                <button
                  type="button"
                  class="board-fab"
                  onclick={() => (storiesOpen = true)}
                  aria-label="Ver historias"
                >
                  Historias
                  {#if roomState.stories.length}
                    <span class="board-fab__count">{roomState.stories.length}</span>
                  {/if}
                </button>
                <button
                  type="button"
                  class="board-fab"
                  onclick={() => (playersOpen = true)}
                  aria-label="Ver participantes"
                >
                  Participantes
                  <span class="board-fab__count">{roomState.players.length}</span>
                </button>
                <button
                  type="button"
                  class="board-fab"
                  onclick={() => (teamsOpen = true)}
                  aria-label="Ver equipos"
                >
                  Equipos
                  {#if roomState.teams.length}
                    <span class="board-fab__count">{roomState.teams.length}</span>
                  {/if}
                </button>
              {/if}
            </div>
            <div class="arena-fabs__right">
              <button
                type="button"
                class="board-fab"
                onclick={() => (resultsOpen = true)}
                disabled={roomState.stories.length === 0}
                aria-label="Ver resultados"
                title={roomState.stories.length === 0 ? 'Añade historias para ver resultados' : undefined}
              >
                Resultados
                {#if roomState.stories.some((s) => s.estimates.overall)}
                  <span class="board-fab__count"
                    >{roomState.stories.filter((s) => s.estimates.overall).length}</span
                  >
                {/if}
              </button>
              {#if isSm}
                <button
                  type="button"
                  class="board-fab board-fab--icon"
                  onclick={() => (moderationOpen = true)}
                  aria-label="Moderación"
                  title="Moderación"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.5.42l-.36 2.54c-.58.23-1.12.54-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.5.4 1.04.72 1.62.94l.36 2.54c.05.24.26.42.5.42h3.8c.24 0 .45-.18.5-.42l.36-2.54c.58-.22 1.12-.54 1.62-.94l2.39.96c.26.1.55 0 .69-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
                    />
                  </svg>
                </button>
              {/if}
              <button
                type="button"
                class="board-fab board-fab--icon board-fab--leave"
                onclick={requestLeave}
                aria-label="Abandonar sala"
                title="Abandonar sala"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        roomName={displayRoomName}
        {roomLink}
        {canNativeShare}
        oncopy={copyRoomLink}
        onshare={shareRoomLink}
        onclose={() => (inviteOpen = false)}
      />

      <PlayersModal
        open={playersOpen && isSm}
        players={roomState.players}
        teams={roomState.teams}
        meId={playerId}
        {isSm}
        onassign={(payload) => send({ type: 'assign_player', ...payload })}
        onremove={requestRemovePlayer}
        onclose={() => (playersOpen = false)}
      />

      <TeamsModal
        open={teamsOpen && isSm}
        teams={roomState.teams}
        players={roomState.players}
        creatable
        oncreate={(name) => send({ type: 'create_team', name })}
        onrename={(teamId, name) => send({ type: 'rename_team', teamId, name })}
        ondelete={requestDeleteTeam}
        onclose={() => (teamsOpen = false)}
      />

      <StoriesModal
        open={storiesOpen && isSm}
        stories={roomState.stories}
        activeStoryId={roomState.activeStoryId}
        selectedStoryId={roundStoryId}
        canManage
        bind:draftTitle={storyTitle}
        oncreate={createStory}
        onupdate={updateStory}
        ondelete={requestDeleteStory}
        onselect={(storyId) => {
          roundStoryId = storyId;
          send({ type: 'select_story', storyId });
          storiesOpen = false;
        }}
        onclose={() => (storiesOpen = false)}
      />

      <ModerationModal
        open={moderationOpen && isSm}
        players={roomState.players}
        meId={playerId}
        bind:transferTargetId
        ontransfer={() => {
          if (!transferTargetId) {
            error = `Elige a quién ceder el rol de ${MODERATOR_LABEL}`;
            return;
          }
          send({ type: 'transfer_scrum', targetPlayerId: transferTargetId });
          transferTargetId = '';
          moderationOpen = false;
        }}
        onrelinquish={() => {
          send({ type: 'relinquish_scrum' });
          moderationOpen = false;
        }}
        onfinalize={() => {
          moderationOpen = false;
          finalizeRoom();
        }}
        onclose={() => (moderationOpen = false)}
      />

      <ResultsModal
        open={resultsOpen}
        roomName={displayRoomName}
        stories={roomState.stories}
        oncopyMd={() => copyResults('md')}
        oncopyCsv={() => copyResults('csv')}
        onclose={() => (resultsOpen = false)}
        onerror={(message) => (error = message)}
      />

      <AvatarModal
        open={avatarOpen}
        avatar={me?.avatar ?? joinAvatar}
        onsave={(avatar) => {
          saveStoredAvatar(avatar);
          joinAvatar = avatar;
          send({ type: 'update_avatar', avatar });
        }}
        onclose={() => (avatarOpen = false)}
      />

      <ConfirmModal
        open={confirmDialog !== null}
        title={confirmDialog === 'close_room'
          ? 'Finalizar sala'
          : confirmDialog === 'remove_player'
            ? 'Quitar participante'
            : confirmDialog === 'delete_story'
              ? 'Eliminar historia'
              : confirmDialog === 'delete_team'
                ? 'Eliminar equipo'
                : confirmDialog === 'leave'
                  ? leaveConfirmCopy.title
                  : 'Cancelar votación'}
        description={confirmDialog === 'close_room'
          ? 'Se cerrará la sesión y se borrarán los datos de la sala.'
          : confirmDialog === 'remove_player'
            ? `Se quitará a “${removeTarget?.name ?? ''}” de la sala. Tendrá que volver a unirse con el link.`
            : confirmDialog === 'delete_story'
              ? `Se eliminará “${deleteStoryTarget?.title ?? ''}” y su estimación. Si hay una votación activa sobre ella, se cancelará.`
              : confirmDialog === 'delete_team'
                ? `Se eliminará “${deleteTeamTarget?.name ?? ''}”. Los participantes asignados quedarán sin equipo.`
                : confirmDialog === 'leave'
                  ? leaveConfirmCopy.description
                  : 'Se cerrará la ronda y se descartarán los votos sin guardarlos.'}
        confirmLabel={confirmDialog === 'close_room'
          ? 'Finalizar'
          : confirmDialog === 'remove_player'
            ? 'Quitar'
            : confirmDialog === 'delete_story' || confirmDialog === 'delete_team'
              ? 'Eliminar'
              : confirmDialog === 'leave'
                ? leaveConfirmCopy.confirmLabel
                : 'Cancelar votación'}
        cancelLabel="Volver"
        onconfirm={acceptConfirm}
        oncancel={dismissConfirm}
      />
    {:else}
      <div class="connecting" role="status" aria-live="polite">
        <div class="connecting__cards" aria-hidden="true">
          <span class="connecting__card connecting__card--back"></span>
          <span class="connecting__card connecting__card--mid"></span>
          <span class="connecting__card connecting__card--front">?</span>
        </div>
        <h2 class="connecting__title">
          {connection === 'closed' ? 'Reconectando…' : 'Entrando a la sala'}
        </h2>
        <p class="connecting__copy">
          {connection === 'closed'
            ? 'Se perdió la conexión. Estamos intentando volver a entrar.'
            : 'Estamos abriendo tu sesión. Esto suele tardar un instante.'}
        </p>
      </div>
    {/if}
  </section>
{/if}

<style>
  .room {
    max-width: 1100px;
    width: 100%;
    margin: 12px auto 32px;
    padding: 0 20px 48px;
    font-family: var(--font-body);
  }

  .room--arena {
    max-width: none;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    margin: 0;
    padding: 8px 12px 12px;
    overflow: hidden;
  }

  .room--arena :global(.topbar__title) {
    font-size: 1.45rem;
  }

  .room--arena :global(.topbar) {
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  .game {
    display: grid;
    gap: 16px;
    align-items: start;
  }

  .room--arena .game {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .game__arena {
    position: relative;
    min-width: 0;
    width: 100%;
  }

  .room--arena .game__arena {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .arena-fabs {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 10px;
    pointer-events: none;
  }

  .arena-fabs__left,
  .arena-fabs__right {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    pointer-events: none;
  }

  .arena-fabs__right {
    justify-content: flex-end;
  }

  .board-fab {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0.55em 1.1em;
    border: 2px solid var(--color-brand);
    border-radius: var(--radius-xl);
    background: rgba(255, 255, 255, 0.94);
    color: var(--color-brand);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(15, 60, 70, 0.16);
    transition:
      background 180ms ease,
      color 180ms ease;
  }

  .board-fab:hover {
    background: var(--color-brand);
    color: white;
  }

  .board-fab:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .board-fab:disabled:hover {
    background: rgba(255, 255, 255, 0.94);
    color: var(--color-brand);
  }

  .board-fab--icon {
    width: 44px;
    padding: 0;
    justify-content: center;
  }

  .board-fab--icon svg {
    display: block;
  }

  .board-fab--leave:hover {
    border-color: var(--color-error);
    background: var(--color-error);
    color: white;
  }

  .board-fab__count {
    display: inline-grid;
    place-items: center;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--color-brand);
    color: white;
    font-size: 0.72rem;
    font-weight: 800;
  }

  .board-fab:hover .board-fab__count {
    background: white;
    color: var(--color-brand);
  }

  .connecting {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: min(52vh, 420px);
    padding: 32px 16px 48px;
    gap: 8px;
  }

  .connecting__cards {
    position: relative;
    width: 72px;
    height: 88px;
    margin-bottom: 16px;
  }

  .connecting__card {
    position: absolute;
    inset: 0;
    border-radius: 10px;
    border: 2px solid var(--color-brand-dark);
    background: white;
    box-shadow: 0 8px 20px rgba(22, 93, 112, 0.18);
  }

  .connecting__card--back {
    background: var(--color-brand-soft);
    transform: rotate(-14deg) translate(-6px, 4px);
    animation: connecting-fan 1.6s ease-in-out infinite;
  }

  .connecting__card--mid {
    background: #d7eef2;
    transform: rotate(8deg) translate(4px, 2px);
    animation: connecting-fan 1.6s ease-in-out infinite 0.12s;
  }

  .connecting__card--front {
    display: grid;
    place-items: center;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 1.6rem;
    color: var(--color-brand-dark);
    animation: connecting-bob 1.6s ease-in-out infinite;
  }

  .connecting__title {
    margin: 0;
    font-family: var(--font-body);
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--color-text);
  }

  .connecting__copy {
    margin: 0;
    max-width: 34ch;
    color: #666;
    line-height: 1.55;
    font-size: 0.98rem;
  }

  @keyframes connecting-pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.85);
    }
    50% {
      opacity: 1;
      transform: scale(1.15);
    }
  }

  @keyframes connecting-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes connecting-fan {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.08);
    }
  }

  .banner {
    background: #f3f7f8;
    border: 1px solid var(--color-brand-soft);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .banner--warn {
    border-color: var(--color-brand);
  }

  .toast {
    position: fixed;
    left: 50%;
    bottom: 28px;
    z-index: 90;
    transform: translateX(-50%);
    max-width: min(92vw, 420px);
    padding: 12px 18px;
    border-radius: var(--radius-md);
    background: #fff5f7;
    border: 1px solid var(--color-error);
    color: var(--color-error);
    font-weight: 700;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    animation: toast-in 180ms ease-out;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
