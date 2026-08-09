import { DurableObject } from 'cloudflare:workers';
import { AppError, ERROR_CODES, ERROR_MESSAGES_EN, type ErrorCode } from '$lib/errors';
import { isInAudience } from '$lib/room/audience';
import { sanitizeAvatar } from '$lib/room/avatar';
import { normalizeCreateRoomConfig } from '$lib/room/createConfig';
import { isDeckId, isValidCard, type DeckId } from '$lib/room/decks';
import { computeSuggestedEstimate } from '$lib/room/estimate';
import {
  sanitizePlayerName,
  sanitizeRoomName,
  sanitizeStoryDescription,
  sanitizeStoryTitle,
  sanitizeTeamName
} from '$lib/room/limits';
import {
  IDLE_TTL_MS,
  MAX_LIFETIME_MS,
  PENDING_MS,
  TIMER_MAX,
  TIMER_MIN,
  isEstimateRule,
  isRevealMode,
  type ActiveRoundPublic,
  type Audience,
  type ClientToServer,
  type CloseReason,
  type ConnectionState,
  type EstimateRule,
  type PlayerAvatarConfig,
  type PlayerPublic,
  type PlayerRole,
  type RevealMode,
  type RoomPublicState,
  type RoundTimer,
  type ServerToClient,
  type StoryPublic,
  type Team
} from '$lib/room/protocol';
import { sanitizeRoleLabel } from '$lib/room/roleLabel';
import { hashPassword, hashToken, randomId, verifyPassword } from './crypto';

type InternalPlayer = {
  id: string;
  name: string;
  role: PlayerRole;
  roleLabel?: string;
  teamId?: string | null;
  avatar?: PlayerAvatarConfig;
  tokenHash: string;
  connection: ConnectionState;
  pendingSince?: number;
  offlineSince?: number;
};

type InternalStory = {
  id: string;
  title: string;
  description?: string;
  suggestedTeamIds?: string[];
  status: StoryPublic['status'];
  estimates: StoryPublic['estimates'];
  estimatedAt?: number;
  roundsPlayed: number;
};

type InternalRound = {
  storyId: string;
  audience: Audience;
  roundNumber: number;
  revealed: boolean;
  suggestedEstimate?: string;
  timer?: RoundTimer;
  votes: Record<string, string | null>;
  startedAt: number;
  autoRevealOnTimerEnd: boolean;
};

type PersistedState = {
  id: string;
  name: string;
  isPrivate: boolean;
  passwordSalt?: string;
  passwordHash?: string;
  deck: DeckId;
  estimateRule: EstimateRule;
  revealMode: RevealMode;
  autoRevealOnTimerEnd: boolean;
  defaultTimerSeconds: number | null;
  scrumMasterPlayerId: string | null;
  createdByPlayerId: string;
  teams: Team[];
  players: InternalPlayer[];
  stories: InternalStory[];
  activeStoryId?: string;
  activeRound?: InternalRound;
  createdAt: number;
  lastActivityAt: number;
  closed?: boolean;
  closeReason?: CloseReason;
  maxEndsAt: number;
  idleEndsAt?: number | null;
  timerEndsAt?: number | null;
};

type SessionAttachment = { playerId: string };

export class Room extends DurableObject<Env> {
  private state: PersistedState | null = null;
  private sockets = new Map<WebSocket, SessionAttachment>();
  private initialized = false;

  private async ensureLoaded(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const stored = await this.ctx.storage.get<PersistedState>('state');
    this.state = stored ?? null;

    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment() as SessionAttachment | null;
      if (attachment?.playerId) {
        this.sockets.set(ws, attachment);
      }
    }

    if (await this.reconcileConnections()) {
      const state = this.state;
      if (!state) return;
      const present = state.players.some(
        (p) => p.connection === 'connected' || p.connection === 'pending'
      );
      if (!present) {
        state.idleEndsAt = Date.now() + IDLE_TTL_MS;
      } else {
        state.idleEndsAt = null;
      }
      await this.persist();
      await this.rescheduleAlarm();
    }
  }

  private async reconcileConnections(): Promise<boolean> {
    if (!this.state || this.state.closed) return false;

    const live = new Set<string>();
    for (const session of this.sockets.values()) {
      if (session.playerId) live.add(session.playerId);
    }

    const now = Date.now();
    let changed = false;

    for (const player of this.state.players) {
      const hasSocket = live.has(player.id);
      if (hasSocket) {
        if (player.connection !== 'connected') {
          player.connection = 'connected';
          player.pendingSince = undefined;
          player.offlineSince = undefined;
          changed = true;
        }
        continue;
      }

      if (player.connection === 'connected') {
        player.connection = 'offline';
        player.offlineSince = now;
        player.pendingSince = undefined;
        changed = true;
      }
    }

    return changed;
  }

  private async persist(): Promise<void> {
    if (!this.state) return;
    await this.ctx.storage.put('state', this.state);
  }

  private touch(): void {
    if (!this.state) return;
    this.state.lastActivityAt = Date.now();
  }

  async fetch(request: Request): Promise<Response> {
    await this.ensureLoaded();
    const url = new URL(request.url);

    if (url.pathname.endsWith('/create') && request.method === 'POST') {
      return this.handleCreate(request);
    }

    if (url.pathname.endsWith('/exists') && request.method === 'GET') {
      if (!this.state || this.state.closed) {
        return Response.json({ ok: false, reason: this.state?.closeReason ?? 'not_found' });
      }
      return Response.json({
        ok: true,
        name: this.state.name,
        isPrivate: this.state.isPrivate,
        teams: this.state.teams,
        deck: this.state.deck,
        estimateRule: this.state.estimateRule
      });
    }

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade();
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleCreate(request: Request): Promise<Response> {
    if (this.state && !this.state.closed) {
      return Response.json({ error: 'Room already exists' }, { status: 409 });
    }

    const body = (await request.json()) as {
      id: string;
      roomName?: string;
      isPrivate?: boolean;
      password?: string;
      deck?: string;
      estimateRule?: string;
      revealMode?: string;
      autoRevealOnTimerEnd?: boolean;
      defaultTimerSeconds?: number | null;
      hostName: string;
      avatar?: PlayerAvatarConfig;
    };

    if (!body.id || !body.hostName?.trim()) {
      return Response.json({ error: 'id and hostName required' }, { status: 400 });
    }

    const roomName = sanitizeRoomName(body.roomName);
    if (!roomName) {
      return Response.json({ error: 'roomName required' }, { status: 400 });
    }

    const now = Date.now();
    const hostId = randomId(8);
    const token = randomId(24);
    const tokenHash = await hashToken(token);
    const isPrivate = Boolean(body.isPrivate);
    let passwordSalt: string | undefined;
    let passwordHash: string | undefined;

    if (isPrivate) {
      if (!body.password?.trim()) {
        return Response.json({ error: 'Password required for private room' }, { status: 400 });
      }
      passwordSalt = randomId(8);
      passwordHash = await hashPassword(body.password, passwordSalt);
    }

    const config = normalizeCreateRoomConfig(body);

    this.state = {
      id: body.id,
      name: roomName,
      isPrivate,
      passwordSalt,
      passwordHash,
      deck: config.deck,
      estimateRule: config.estimateRule,
      revealMode: config.revealMode,
      autoRevealOnTimerEnd: config.autoRevealOnTimerEnd,
      defaultTimerSeconds: config.defaultTimerSeconds,
      scrumMasterPlayerId: hostId,
      createdByPlayerId: hostId,
      teams: [],
      players: [
        {
          id: hostId,
          name: sanitizePlayerName(body.hostName),
          role: 'voter',
          avatar: sanitizeAvatar(body.avatar),
          tokenHash,
          connection: 'offline'
        }
      ],
      stories: [],
      createdAt: now,
      lastActivityAt: now,
      maxEndsAt: now + MAX_LIFETIME_MS,
      idleEndsAt: now + IDLE_TTL_MS,
      timerEndsAt: null
    };

    await this.persist();
    await this.rescheduleAlarm();

    return Response.json({
      id: body.id,
      name: roomName,
      playerId: hostId,
      token,
      isPrivate,
      deck: config.deck,
      estimateRule: config.estimateRule,
      revealMode: config.revealMode
    });
  }

  private handleWebSocketUpgrade(): Response {
    if (!this.state || this.state.closed) {
      return new Response('Room closed', { status: 410 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    this.sockets.set(server, { playerId: '' });

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    await this.ensureLoaded();
    if (typeof message !== 'string') return;

    let msg: ClientToServer;
    try {
      msg = JSON.parse(message) as ClientToServer;
    } catch {
      this.sendError(ws, ERROR_CODES.invalid_message);
      return;
    }

    try {
      await this.onMessage(ws, msg);
    } catch (err) {
      if (err instanceof AppError) {
        this.sendError(ws, err.code);
        return;
      }
      const text = err instanceof Error ? err.message : ERROR_MESSAGES_EN.internal_error;
      this.send(ws, { type: 'error', message: text, code: ERROR_CODES.internal_error });
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    await this.ensureLoaded();
    const session = this.sockets.get(ws);
    this.sockets.delete(ws);
    if (!this.state || !session?.playerId) return;

    const stillOpen = [...this.sockets.values()].some((s) => s.playerId === session.playerId);
    if (stillOpen) return;

    const player = this.state.players.find((p) => p.id === session.playerId);
    if (!player) return;

    player.connection = 'pending';
    player.pendingSince = Date.now();
    await this.persist();
    await this.rescheduleAlarm();
    this.broadcastSync();
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws);
  }

  async alarm(): Promise<void> {
    await this.ensureLoaded();
    if (!this.state || this.state.closed) return;

    const now = Date.now();

    for (const player of this.state.players) {
      if (
        player.connection === 'pending' &&
        player.pendingSince &&
        now - player.pendingSince >= PENDING_MS
      ) {
        player.connection = 'offline';
        player.offlineSince = now;
        player.pendingSince = undefined;
      }
    }

    if (
      this.state.activeRound?.timer?.status === 'running' &&
      this.state.timerEndsAt &&
      now >= this.state.timerEndsAt
    ) {
      this.finishTimer(now);
    }

    const presentCount = this.state.players.filter(
      (p) => p.connection === 'connected' || p.connection === 'pending'
    ).length;
    if (presentCount === 0) {
      if (!this.state.idleEndsAt) {
        this.state.idleEndsAt = now + IDLE_TTL_MS;
      } else if (now >= this.state.idleEndsAt) {
        await this.closeRoom('idle');
        return;
      }
    } else {
      this.state.idleEndsAt = null;
    }

    if (now >= this.state.maxEndsAt) {
      await this.closeRoom('expired');
      return;
    }

    await this.persist();
    await this.rescheduleAlarm();
    this.broadcastSync();
  }

  private finishTimer(now: number): void {
    const round = this.state?.activeRound;
    const timer = round?.timer;
    if (!round || !timer) return;
    timer.status = 'finished';
    timer.finishedAt = now;
    this.state!.timerEndsAt = null;

    if (round.autoRevealOnTimerEnd && !round.revealed) {
      this.doReveal();
    }
  }

  private async rescheduleAlarm(): Promise<void> {
    if (!this.state || this.state.closed) {
      await this.ctx.storage.deleteAlarm();
      return;
    }

    const candidates: number[] = [this.state.maxEndsAt];
    if (this.state.timerEndsAt) candidates.push(this.state.timerEndsAt);
    if (this.state.idleEndsAt) candidates.push(this.state.idleEndsAt);

    for (const player of this.state.players) {
      if (player.connection === 'pending' && player.pendingSince) {
        candidates.push(player.pendingSince + PENDING_MS);
      }
    }

    const next = Math.min(...candidates);
    await this.ctx.storage.setAlarm(next);
  }

  private async onMessage(ws: WebSocket, msg: ClientToServer): Promise<void> {
    if (!this.state || this.state.closed) {
      this.send(ws, { type: 'room_closed', reason: this.state?.closeReason ?? 'not_found', results: [] });
      return;
    }

    this.touch();

    switch (msg.type) {
      case 'join':
        await this.handleJoin(ws, msg);
        break;
      case 'rejoin':
        await this.handleRejoin(ws, msg);
        break;
      case 'update_avatar':
        await this.handleUpdateAvatar(ws, msg.avatar);
        break;
      case 'leave':
        await this.handleLeave(ws);
        break;
      case 'transfer_scrum':
        await this.requireSm(ws, async (actor) => {
          const target = this.state!.players.find((p) => p.id === msg.targetPlayerId);
          if (!target) throw new AppError(ERROR_CODES.player_not_found);
          if (target.connection !== 'connected') throw new AppError(ERROR_CODES.player_not_connected);
          this.state!.scrumMasterPlayerId = target.id;
          void actor;
        });
        break;
      case 'claim_scrum':
        await this.handleClaimScrum(ws);
        break;
      case 'relinquish_scrum':
        await this.requireSm(ws, async () => {
          this.state!.scrumMasterPlayerId = null;
        });
        break;
      case 'create_team':
        await this.requireSm(ws, async () => {
          const name = sanitizeTeamName(msg.name);
          if (!name) throw new AppError(ERROR_CODES.team_name_required);
          if (this.state!.teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
            throw new AppError(ERROR_CODES.team_exists);
          }
          this.state!.teams.push({ id: randomId(4), name });
        });
        break;
      case 'rename_team':
        await this.requireSm(ws, async () => {
          const team = this.state!.teams.find((t) => t.id === msg.teamId);
          if (!team) throw new AppError(ERROR_CODES.team_not_found);
          const name = sanitizeTeamName(msg.name);
          if (!name) throw new AppError(ERROR_CODES.team_name_invalid);
          if (
            this.state!.teams.some(
              (t) => t.id !== team.id && t.name.toLowerCase() === name.toLowerCase()
            )
          ) {
            throw new AppError(ERROR_CODES.team_exists);
          }
          team.name = name;
          for (const story of this.state!.stories) {
            for (const estimate of story.estimates.byTeam ?? []) {
              if (estimate.teamId === team.id) estimate.teamName = name;
            }
          }
        });
        break;
      case 'delete_team':
        await this.requireSm(ws, async () => {
          const idx = this.state!.teams.findIndex((t) => t.id === msg.teamId);
          if (idx < 0) throw new AppError(ERROR_CODES.team_not_found);
          const teamId = msg.teamId;
          this.state!.teams.splice(idx, 1);
          for (const player of this.state!.players) {
            if (player.teamId === teamId) player.teamId = null;
          }
          for (const story of this.state!.stories) {
            if (story.suggestedTeamIds?.length) {
              story.suggestedTeamIds = story.suggestedTeamIds.filter((id) => id !== teamId);
            }
          }
          const round = this.state!.activeRound;
          if (round?.audience.type === 'teams') {
            const teamIds = round.audience.teamIds.filter((id) => id !== teamId);
            round.audience = teamIds.length
              ? { type: 'teams', teamIds }
              : { type: 'all_voters' };
          }
        });
        break;
      case 'assign_player':
        await this.requireSm(ws, async () => {
          const player = this.state!.players.find((p) => p.id === msg.playerId);
          if (!player) throw new AppError(ERROR_CODES.player_not_found);
          if (msg.teamId !== undefined) {
            if (msg.teamId !== null && !this.state!.teams.some((t) => t.id === msg.teamId)) {
              throw new AppError(ERROR_CODES.team_not_found);
            }
            player.teamId = msg.teamId;
          }
          if (msg.role) player.role = msg.role;
          if (msg.roleLabel !== undefined) player.roleLabel = sanitizeRoleLabel(msg.roleLabel);
        });
        break;
      case 'remove_player':
        await this.requireSm(ws, async (actor) => {
          this.removePlayer(actor.id, msg.playerId);
        });
        break;
      case 'create_story':
        await this.requireSm(ws, async () => {
          const title = sanitizeStoryTitle(msg.title);
          if (!title) throw new AppError(ERROR_CODES.story_title_required);
          this.state!.stories.push({
            id: randomId(4),
            title,
            description: sanitizeStoryDescription(msg.description),
            suggestedTeamIds: msg.suggestedTeamIds,
            status: 'pending',
            estimates: {},
            roundsPlayed: 0
          });
        });
        break;
      case 'update_story':
        await this.requireSm(ws, async () => {
          const story = this.state!.stories.find((s) => s.id === msg.storyId);
          if (!story) throw new AppError(ERROR_CODES.story_not_found);
          const title = sanitizeStoryTitle(msg.title);
          if (!title) throw new AppError(ERROR_CODES.story_title_required);
          story.title = title;
          if (msg.description !== undefined) {
            story.description = sanitizeStoryDescription(msg.description);
          }
        });
        break;
      case 'delete_story':
        await this.requireSm(ws, async () => {
          const idx = this.state!.stories.findIndex((s) => s.id === msg.storyId);
          if (idx < 0) throw new AppError(ERROR_CODES.story_not_found);
          const storyId = msg.storyId;
          if (this.state!.activeRound?.storyId === storyId) {
            this.state!.activeRound = undefined;
            this.state!.timerEndsAt = null;
          }
          this.state!.stories.splice(idx, 1);
          if (this.state!.activeStoryId === storyId) {
            this.state!.activeStoryId = this.state!.stories[0]?.id;
          }
        });
        break;
      case 'select_story':
        await this.requireSm(ws, async () => {
          const story = this.state!.stories.find((s) => s.id === msg.storyId);
          if (!story) throw new AppError(ERROR_CODES.story_not_found);
          this.state!.activeStoryId = story.id;
        });
        break;
      case 'start_round':
        await this.requireSm(ws, async () => {
          this.startRound(msg.storyId, msg.audience, msg.timerSeconds, msg.autoRevealOnTimerEnd);
        });
        break;
      case 'set_timer':
        await this.requireSm(ws, async () => {
          this.setTimer(msg.durationSeconds);
        });
        break;
      case 'cancel_timer':
        await this.requireSm(ws, async () => {
          this.abortRound();
        });
        break;
      case 'vote':
        await this.handleVote(ws, msg.value);
        break;
      case 'reveal':
        await this.requireSm(ws, async () => {
          if (!this.state!.activeRound) throw new AppError(ERROR_CODES.no_active_round);
          if (this.state!.activeRound.revealed) return;
          this.doReveal();
        });
        break;
      case 'revote':
        await this.requireSm(ws, async () => {
          this.revote(msg.timerSeconds);
        });
        break;
      case 'close_voting':
        await this.requireSm(ws, async () => {
          this.closeVoting(msg.estimate, msg.teamId);
        });
        break;
      case 'skip_story':
        await this.requireSm(ws, async () => {
          const story = this.state!.stories.find((s) => s.id === msg.storyId);
          if (!story) throw new AppError(ERROR_CODES.story_not_found);
          story.status = 'skipped';
          if (this.state!.activeRound?.storyId === story.id) {
            this.state!.activeRound = undefined;
            this.state!.timerEndsAt = null;
          }
        });
        break;
      case 'update_config':
        await this.requireSm(ws, async () => {
          if (typeof msg.name === 'string') {
            const nextName = sanitizeRoomName(msg.name);
            if (!nextName) throw new AppError(ERROR_CODES.room_name_empty);
            this.state!.name = nextName;
          }
          if (msg.deck && isDeckId(msg.deck)) this.state!.deck = msg.deck;
          if (msg.estimateRule && isEstimateRule(msg.estimateRule)) {
            this.state!.estimateRule = msg.estimateRule;
          }
          if (msg.revealMode && isRevealMode(msg.revealMode)) this.state!.revealMode = msg.revealMode;
          if (typeof msg.autoRevealOnTimerEnd === 'boolean') {
            this.state!.autoRevealOnTimerEnd = msg.autoRevealOnTimerEnd;
          }
          if (msg.defaultTimerSeconds !== undefined) {
            this.state!.defaultTimerSeconds = msg.defaultTimerSeconds;
          }
        });
        break;
      case 'close_room':
        await this.requireSm(ws, async () => {
          await this.closeRoom('host');
        });
        return;
      default:
        this.sendError(ws, ERROR_CODES.unsupported_action);
        return;
    }

    await this.persist();
    await this.rescheduleAlarm();
    this.broadcastSync();
  }

  private async handleJoin(
    ws: WebSocket,
    msg: Extract<ClientToServer, { type: 'join' }>
  ): Promise<void> {
    if (!this.state) throw new AppError(ERROR_CODES.room_unavailable);

    if (msg.playerId && msg.token) {
      await this.handleRejoin(ws, { type: 'rejoin', playerId: msg.playerId, token: msg.token });
      return;
    }

    const name = sanitizePlayerName(msg.name);
    if (!name) throw new AppError(ERROR_CODES.player_name_required);

    if (
      this.state.players.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.connection === 'connected'
      )
    ) {
      throw new AppError(ERROR_CODES.player_name_taken);
    }

    if (this.state.isPrivate) {
      if (!msg.password || !this.state.passwordSalt || !this.state.passwordHash) {
        throw new AppError(ERROR_CODES.password_required);
      }
      const ok = await verifyPassword(msg.password, this.state.passwordSalt, this.state.passwordHash);
      if (!ok) throw new AppError(ERROR_CODES.password_incorrect);
    }

    if (msg.teamId && !this.state.teams.some((t) => t.id === msg.teamId)) {
      throw new AppError(ERROR_CODES.team_not_found);
    }

    const playerId = randomId(8);
    const token = randomId(24);
    const tokenHash = await hashToken(token);

    this.state.players = this.state.players.filter(
      (p) => !(p.name.toLowerCase() === name.toLowerCase() && p.connection !== 'connected')
    );

    this.state.players.push({
      id: playerId,
      name,
      role: msg.role === 'observer' ? 'observer' : 'voter',
      roleLabel: sanitizeRoleLabel(msg.roleLabel),
      teamId: msg.teamId ?? null,
      avatar: sanitizeAvatar(msg.avatar),
      tokenHash,
      connection: 'connected'
    });

    this.ensureScrumMaster(playerId);

    this.bindSocket(ws, playerId);
    this.state.idleEndsAt = null;
    await this.persist();
    await this.rescheduleAlarm();
    this.send(ws, { type: 'sync', state: this.toPublic(playerId), you: { playerId, token } });
    this.broadcastSync(ws);
  }

  private async handleRejoin(
    ws: WebSocket,
    msg: Extract<ClientToServer, { type: 'rejoin' }>
  ): Promise<void> {
    if (!this.state) throw new AppError(ERROR_CODES.room_unavailable);
    const player = this.state.players.find((p) => p.id === msg.playerId);
    if (!player) {
      this.sendError(ws, ERROR_CODES.session_invalid);
      return;
    }

    const tokenHash = await hashToken(msg.token);
    if (tokenHash !== player.tokenHash) {
      this.sendError(ws, ERROR_CODES.session_invalid);
      return;
    }

    for (const [otherWs, session] of this.sockets) {
      if (session.playerId === player.id && otherWs !== ws) {
        this.send(otherWs, { type: 'session_taken' });
        try {
          otherWs.close(4000, 'session_taken');
        } catch {
          /* ignore */
        }
        this.sockets.delete(otherWs);
      }
    }

    player.connection = 'connected';
    player.pendingSince = undefined;
    player.offlineSince = undefined;
    this.bindSocket(ws, player.id);
    this.state.idleEndsAt = null;
    this.ensureScrumMaster(player.id);

    await this.persist();
    await this.rescheduleAlarm();
    this.send(ws, {
      type: 'sync',
      state: this.toPublic(player.id),
      you: { playerId: player.id, token: msg.token }
    });
    this.broadcastSync(ws);
  }

  private async handleUpdateAvatar(ws: WebSocket, avatar: PlayerAvatarConfig): Promise<void> {
    const player = this.requireConnected(ws);
    player.avatar = sanitizeAvatar(avatar);
    await this.persist();
    this.broadcastSync();
  }

  private async handleLeave(ws: WebSocket): Promise<void> {
    const session = this.sockets.get(ws);
    if (!session?.playerId || !this.state) return;
    const playerId = session.playerId;

    this.sockets.delete(ws);
    try {
      ws.close(1000, 'leave');
    } catch {
      /* ignore */
    }

    if (!this.state.players.some((p) => p.id === playerId)) return;

    this.state.players = this.state.players.filter((p) => p.id !== playerId);

    if (this.state.activeRound?.votes[playerId] !== undefined) {
      delete this.state.activeRound.votes[playerId];
    }

    if (this.state.scrumMasterPlayerId === playerId) {
      const successor = this.state.players.find((p) => p.connection === 'connected');
      this.state.scrumMasterPlayerId = successor?.id ?? null;
    }

    const someonePresent = this.state.players.some(
      (p) => p.connection === 'connected' || p.connection === 'pending'
    );
    if (!someonePresent && !this.state.idleEndsAt) {
      this.state.idleEndsAt = Date.now() + IDLE_TTL_MS;
    }
  }

  private removePlayer(actorId: string, targetPlayerId: string): void {
    if (!this.state) return;
    if (targetPlayerId === actorId) {
      throw new AppError(ERROR_CODES.cannot_remove_self);
    }
    const target = this.state.players.find((p) => p.id === targetPlayerId);
    if (!target) throw new AppError(ERROR_CODES.player_not_found);

    for (const [socket, session] of [...this.sockets.entries()]) {
      if (session.playerId !== targetPlayerId) continue;
      this.send(socket, { type: 'removed', reason: 'kicked' });
      try {
        socket.close(4002, 'removed');
      } catch {
        /* ignore */
      }
      this.sockets.delete(socket);
    }

    this.state.players = this.state.players.filter((p) => p.id !== targetPlayerId);

    if (this.state.scrumMasterPlayerId === targetPlayerId) {
      this.state.scrumMasterPlayerId = actorId;
    }

    if (this.state.activeRound?.votes[targetPlayerId] !== undefined) {
      delete this.state.activeRound.votes[targetPlayerId];
    }
  }

  private async handleClaimScrum(ws: WebSocket): Promise<void> {
    const actor = this.requireConnected(ws);
    if (!this.state) return;

    if (!this.state.scrumMasterPlayerId) {
      this.state.scrumMasterPlayerId = actor.id;
      return;
    }

    if (this.state.scrumMasterPlayerId === actor.id) return;

    const sm = this.state.players.find((p) => p.id === this.state!.scrumMasterPlayerId);
    if (!sm) {
      this.state.scrumMasterPlayerId = actor.id;
      return;
    }

    if (sm.connection === 'connected' || sm.connection === 'pending') {
      throw new AppError(ERROR_CODES.moderator_in_room);
    }

    this.state.scrumMasterPlayerId = actor.id;
  }

  private ensureScrumMaster(playerId: string): void {
    if (!this.state) return;
    if (!this.state.scrumMasterPlayerId) {
      this.state.scrumMasterPlayerId = playerId;
      return;
    }
    if (this.state.scrumMasterPlayerId === playerId) return;
    const sm = this.state.players.find((p) => p.id === this.state!.scrumMasterPlayerId);
    if (!sm || sm.connection === 'offline') {
      this.state.scrumMasterPlayerId = playerId;
    }
  }

  private async handleVote(ws: WebSocket, value: string): Promise<void> {
    const actor = this.requireConnected(ws);
    if (!this.state?.activeRound) throw new AppError(ERROR_CODES.no_active_round);
    if (this.state.activeRound.revealed) throw new AppError(ERROR_CODES.round_already_revealed);
    if (actor.role !== 'voter') throw new AppError(ERROR_CODES.observers_cannot_vote);
    if (!isInAudience(actor, this.state.activeRound.audience)) {
      throw new AppError(ERROR_CODES.not_in_audience);
    }
    if (!isValidCard(this.state.deck, value)) throw new AppError(ERROR_CODES.invalid_card);

    this.state.activeRound.votes[actor.id] = value;
  }

  private startRound(
    storyId: string,
    audience: Audience | undefined,
    timerSeconds: number | null | undefined,
    autoReveal?: boolean
  ): void {
    if (!this.state) return;
    const story = this.state.stories.find((s) => s.id === storyId);
    if (!story) throw new AppError(ERROR_CODES.story_not_found);

    const resolvedAudience: Audience = audience ?? { type: 'all_voters' };
    story.status = 'voting';
    this.state.activeStoryId = storyId;
    story.roundsPlayed += 1;

    const seconds =
      timerSeconds === null
        ? null
        : typeof timerSeconds === 'number'
          ? timerSeconds
          : this.state.defaultTimerSeconds;

    let timer: RoundTimer | undefined;
    let timerEndsAt: number | null = null;
    if (typeof seconds === 'number') {
      const duration = Math.min(TIMER_MAX, Math.max(TIMER_MIN, Math.round(seconds)));
      const endsAt = Date.now() + duration * 1000;
      timer = { durationSeconds: duration, endsAt, status: 'running' };
      timerEndsAt = endsAt;
    }

    this.state.activeRound = {
      storyId,
      audience: resolvedAudience,
      roundNumber: story.roundsPlayed,
      revealed: false,
      votes: {},
      startedAt: Date.now(),
      timer,
      autoRevealOnTimerEnd: autoReveal ?? this.state.autoRevealOnTimerEnd
    };
    this.state.timerEndsAt = timerEndsAt;
  }

  private setTimer(durationSeconds: number): void {
    if (!this.state?.activeRound) throw new AppError(ERROR_CODES.no_active_round);
    if (this.state.activeRound.revealed) throw new AppError(ERROR_CODES.round_already_revealed);
    const duration = Math.min(TIMER_MAX, Math.max(TIMER_MIN, Math.round(durationSeconds)));
    const endsAt = Date.now() + duration * 1000;
    this.state.activeRound.timer = { durationSeconds: duration, endsAt, status: 'running' };
    this.state.activeRound.autoRevealOnTimerEnd = this.state.autoRevealOnTimerEnd;
    this.state.timerEndsAt = endsAt;
  }

  private abortRound(): void {
    if (!this.state?.activeRound) throw new AppError(ERROR_CODES.no_active_round);
    const round = this.state.activeRound;
    const story = this.state.stories.find((s) => s.id === round.storyId);
    if (story && story.status === 'voting') {
      story.status = story.estimates.overall ? 'estimated' : 'pending';
    }
    if (story && story.roundsPlayed > 0) {
      story.roundsPlayed -= 1;
    }
    this.state.activeRound = undefined;
    this.state.timerEndsAt = null;
  }

  private doReveal(): void {
    if (!this.state?.activeRound) return;
    const round = this.state.activeRound;
    round.revealed = true;
    if (round.timer?.status === 'running') {
      round.timer.status = 'finished';
      round.timer.finishedAt = Date.now();
      this.state.timerEndsAt = null;
    }
    round.suggestedEstimate = computeSuggestedEstimate(
      this.state.deck,
      round.votes,
      this.state.estimateRule
    );
  }

  private revote(timerSeconds?: number | null): void {
    if (!this.state?.activeRound) throw new AppError(ERROR_CODES.no_active_round);
    const prev = this.state.activeRound;
    this.startRound(prev.storyId, prev.audience, timerSeconds, prev.autoRevealOnTimerEnd);
  }

  private closeVoting(estimate?: string, teamId?: string): void {
    if (!this.state?.activeRound) throw new AppError(ERROR_CODES.no_active_round);
    const round = this.state.activeRound;
    if (!round.revealed) throw new AppError(ERROR_CODES.reveal_before_close);

    const story = this.state.stories.find((s) => s.id === round.storyId);
    if (!story) throw new AppError(ERROR_CODES.story_not_found);

    let value = estimate?.trim();
    if (!value) {
      if (this.state.estimateRule === 'consensus') {
        throw new AppError(ERROR_CODES.consensus_required);
      }
      value = round.suggestedEstimate;
    }
    if (!value) throw new AppError(ERROR_CODES.no_estimation_to_save);

    if (teamId) {
      const team = this.state.teams.find((t) => t.id === teamId);
      if (!team) throw new AppError(ERROR_CODES.team_not_found);
      story.estimates.byTeam = [
        ...(story.estimates.byTeam ?? []).filter((e) => e.teamId !== teamId),
        { teamId, teamName: team.name, value }
      ];
    } else {
      story.estimates.overall = value;
      story.status = 'estimated';
      story.estimatedAt = Date.now();
    }

    if (teamId && !story.estimates.overall) {
      story.status = 'voting';
    }

    this.state.activeRound = undefined;
    this.state.timerEndsAt = null;
  }

  private async closeRoom(reason: CloseReason): Promise<void> {
    if (!this.state) return;
    this.state.closed = true;
    this.state.closeReason = reason;
    const results = this.state.stories.map((s) => this.storyPublic(s));

    const payload: ServerToClient = { type: 'room_closed', reason, results };
    for (const ws of this.sockets.keys()) {
      this.send(ws, payload);
      try {
        ws.close(4001, reason);
      } catch {
        /* ignore */
      }
    }
    this.sockets.clear();
    await this.persist();
    await this.ctx.storage.deleteAlarm();
  }

  private bindSocket(ws: WebSocket, playerId: string): void {
    const attachment: SessionAttachment = { playerId };
    ws.serializeAttachment(attachment);
    this.sockets.set(ws, attachment);
  }

  private requireConnected(ws: WebSocket): InternalPlayer {
    const session = this.sockets.get(ws);
    if (!session?.playerId || !this.state) throw new AppError(ERROR_CODES.not_authenticated);
    const player = this.state.players.find((p) => p.id === session.playerId);
    if (!player || player.connection !== 'connected') throw new AppError(ERROR_CODES.not_connected);
    return player;
  }

  private async requireSm(
    ws: WebSocket,
    fn: (actor: InternalPlayer) => Promise<void> | void
  ): Promise<void> {
    const actor = this.requireConnected(ws);
    if (!this.state || this.state.scrumMasterPlayerId !== actor.id) {
      throw new AppError(ERROR_CODES.moderator_only);
    }
    await fn(actor);
  }

  private sendError(ws: WebSocket, code: ErrorCode): void {
    this.send(ws, { type: 'error', code, message: ERROR_MESSAGES_EN[code] });
  }

  private send(ws: WebSocket, msg: ServerToClient): void {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* ignore */
    }
  }

  private broadcastSync(except?: WebSocket): void {
    if (!this.state) return;
    for (const [ws, session] of this.sockets) {
      if (ws === except) continue;
      if (!session.playerId) continue;
      this.send(ws, { type: 'sync', state: this.toPublic(session.playerId) });
    }
  }

  private storyPublic(story: InternalStory): StoryPublic {
    return {
      id: story.id,
      title: story.title,
      description: story.description,
      suggestedTeamIds: story.suggestedTeamIds,
      status: story.status,
      estimates: story.estimates,
      estimatedAt: story.estimatedAt,
      roundsPlayed: story.roundsPlayed
    };
  }

  private normalizeStoryStatuses(): void {
    if (!this.state) return;
    const activeStoryId = this.state.activeRound?.storyId;
    for (const story of this.state.stories) {
      if (story.status !== 'voting' || story.id === activeStoryId) continue;
      story.status = story.estimates.overall ? 'estimated' : 'pending';
    }
  }

  private toPublic(viewerId?: string): RoomPublicState {
    this.normalizeStoryStatuses();
    const s = this.state!;
    const players: PlayerPublic[] = s.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      roleLabel: sanitizeRoleLabel(p.roleLabel),
      teamId: p.teamId,
      avatar: sanitizeAvatar(p.avatar),
      connection: p.connection,
      isScrumMaster: s.scrumMasterPlayerId === p.id,
      offlineSince: p.connection === 'offline' ? p.offlineSince : undefined
    }));

    let activeRound: ActiveRoundPublic | undefined;
    if (s.activeRound) {
      const votes: ActiveRoundPublic['votes'] = {};
      for (const [pid, value] of Object.entries(s.activeRound.votes)) {
        if (s.activeRound.revealed || s.revealMode === 'live') {
          votes[pid] = value;
        } else if (pid === viewerId) {
          votes[pid] = value;
        } else if (value) {
          votes[pid] = 'hidden';
        } else {
          votes[pid] = null;
        }
      }
      activeRound = {
        storyId: s.activeRound.storyId,
        audience: s.activeRound.audience,
        roundNumber: s.activeRound.roundNumber,
        revealed: s.activeRound.revealed,
        suggestedEstimate: s.activeRound.revealed ? s.activeRound.suggestedEstimate : undefined,
        timer: s.activeRound.timer,
        votes,
        startedAt: s.activeRound.startedAt
      };
    }

    return {
      id: s.id,
      name: s.name || s.id,
      isPrivate: s.isPrivate,
      deck: s.deck,
      estimateRule: s.estimateRule,
      revealMode: s.revealMode,
      autoRevealOnTimerEnd: s.autoRevealOnTimerEnd,
      defaultTimerSeconds: s.defaultTimerSeconds,
      scrumMasterPlayerId: s.scrumMasterPlayerId,
      createdByPlayerId: s.createdByPlayerId,
      teams: s.teams,
      players,
      stories: s.stories.map((st) => this.storyPublic(st)),
      activeStoryId: s.activeStoryId,
      activeRound,
      createdAt: s.createdAt,
      closed: s.closed,
      closeReason: s.closeReason
    };
  }
}
