import type { PlayerAvatarConfig } from './avatar';
import type { DeckId } from './decks';

export type { PlayerAvatarConfig } from './avatar';

export type EstimateRule = 'consensus' | 'mode' | 'median' | 'mean';
export type RevealMode = 'hidden' | 'live';
export type PlayerRole = 'voter' | 'observer';
export type ConnectionState = 'connected' | 'pending' | 'offline';
export type StoryStatus = 'pending' | 'voting' | 'estimated' | 'skipped';
export type CloseReason = 'idle' | 'expired' | 'host' | 'not_found';

export type Audience =
  | { type: 'all_voters' }
  | { type: 'teams'; teamIds: string[] };

export type RoundTimer = {
  durationSeconds: number;
  endsAt: number;
  status: 'running' | 'cancelled' | 'finished';
  cancelledAt?: number;
  finishedAt?: number;
};

export type Team = { id: string; name: string };

export type PlayerPublic = {
  id: string;
  name: string;
  role: PlayerRole;
  roleLabel?: string;
  teamId?: string | null;
  avatar: PlayerAvatarConfig;
  connection: ConnectionState;
  isScrumMaster: boolean;
  offlineSince?: number;
};

export type StoryPublic = {
  id: string;
  title: string;
  description?: string;
  suggestedTeamIds?: string[];
  status: StoryStatus;
  estimates: {
    overall?: string;
    byTeam?: { teamId: string; teamName: string; value: string }[];
  };
  estimatedAt?: number;
  roundsPlayed?: number;
};

export type ActiveRoundPublic = {
  storyId: string;
  audience: Audience;
  roundNumber: number;
  revealed: boolean;
  suggestedEstimate?: string;
  timer?: RoundTimer;
  votes: Record<string, string | null | 'hidden'>;
  startedAt: number;
};

export type RoomPublicState = {
  id: string;
  name: string;
  isPrivate: boolean;
  deck: DeckId;
  estimateRule: EstimateRule;
  revealMode: RevealMode;
  autoRevealOnTimerEnd: boolean;
  defaultTimerSeconds: number | null;
  scrumMasterPlayerId: string | null;
  createdByPlayerId: string;
  teams: Team[];
  players: PlayerPublic[];
  stories: StoryPublic[];
  activeStoryId?: string;
  activeRound?: ActiveRoundPublic;
  createdAt: number;
  closed?: boolean;
  closeReason?: CloseReason;
};

export type ClientToServer =
  | {
      type: 'join';
      name: string;
      password?: string;
      role?: PlayerRole;
      roleLabel?: string;
      teamId?: string | null;
      avatar?: PlayerAvatarConfig;
      token?: string;
      playerId?: string;
    }
  | { type: 'rejoin'; playerId: string; token: string }
  | { type: 'update_avatar'; avatar: PlayerAvatarConfig }
  | { type: 'leave' }
  | { type: 'transfer_scrum'; targetPlayerId: string }
  | { type: 'claim_scrum' }
  | { type: 'relinquish_scrum' }
  | { type: 'create_team'; name: string }
  | { type: 'rename_team'; teamId: string; name: string }
  | { type: 'delete_team'; teamId: string }
  | { type: 'assign_player'; playerId: string; teamId?: string | null; role?: PlayerRole; roleLabel?: string }
  | { type: 'remove_player'; playerId: string }
  | { type: 'create_story'; title: string; description?: string; suggestedTeamIds?: string[] }
  | { type: 'update_story'; storyId: string; title: string; description?: string }
  | { type: 'delete_story'; storyId: string }
  | { type: 'select_story'; storyId: string }
  | { type: 'start_round'; storyId: string; audience?: Audience; timerSeconds?: number | null; autoRevealOnTimerEnd?: boolean }
  | { type: 'set_timer'; durationSeconds: number }
  | { type: 'cancel_timer' }
  | { type: 'vote'; value: string }
  | { type: 'reveal' }
  | { type: 'revote'; timerSeconds?: number | null }
  | { type: 'close_voting'; estimate?: string; teamId?: string }
  | { type: 'skip_story'; storyId: string }
  | { type: 'update_config'; name?: string; deck?: DeckId; estimateRule?: EstimateRule; revealMode?: RevealMode; autoRevealOnTimerEnd?: boolean; defaultTimerSeconds?: number | null }
  | { type: 'close_room' };

export type ServerToClient =
  | { type: 'sync'; state: RoomPublicState; you?: { playerId: string; token: string } }
  | { type: 'error'; message: string; code?: string }
  | { type: 'session_taken' }
  | { type: 'removed'; reason: 'kicked' }
  | {
      type: 'room_closed';
      reason: CloseReason;
      results: StoryPublic[];
    };

export const IDLE_TTL_MS = 30 * 60 * 1000;
export const MAX_LIFETIME_MS = 8 * 60 * 60 * 1000;
export const PENDING_MS = 15_000;
export const CLAIM_GRACE_MS = 2 * 60 * 1000;
export const TIMER_PRESETS = [30, 60, 90, 120] as const;
export const TIMER_MIN = 15;
export const TIMER_MAX = 600;

export function isEstimateRule(value: unknown): value is EstimateRule {
  return value === 'consensus' || value === 'mode' || value === 'median' || value === 'mean';
}

export function isRevealMode(value: unknown): value is RevealMode {
  return value === 'hidden' || value === 'live';
}
