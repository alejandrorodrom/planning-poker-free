import type { Audience, ConnectionState, PlayerRole } from './protocol';

export function isInAudience(
  player: { teamId?: string | null },
  audience: Audience
): boolean {
  if (audience.type === 'all_voters') return true;
  return Boolean(player.teamId && audience.teamIds.includes(player.teamId));
}

export function canCastVote(
  player: {
    role: PlayerRole;
    teamId?: string | null;
    connection?: ConnectionState;
  },
  round: { audience: Audience; revealed: boolean },
  opts?: { requireConnected?: boolean }
): boolean {
  if (round.revealed) return false;
  if (player.role !== 'voter') return false;
  if (opts?.requireConnected && player.connection !== 'connected') return false;
  return isInAudience(player, round.audience);
}
