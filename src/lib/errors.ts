export const ERROR_CODES = {
  display_name_required: 'display_name_required',
  room_name_required: 'room_name_required',
  room_name_empty: 'room_name_empty',
  password_required: 'password_required',
  password_incorrect: 'password_incorrect',
  room_not_found: 'room_not_found',
  room_unavailable: 'room_unavailable',
  room_closed: 'room_closed',
  invalid_message: 'invalid_message',
  connection_error: 'connection_error',
  internal_error: 'internal_error',
  player_not_found: 'player_not_found',
  player_not_connected: 'player_not_connected',
  player_name_required: 'player_name_required',
  player_name_taken: 'player_name_taken',
  cannot_remove_self: 'cannot_remove_self',
  team_name_required: 'team_name_required',
  team_exists: 'team_exists',
  team_not_found: 'team_not_found',
  team_name_invalid: 'team_name_invalid',
  story_title_required: 'story_title_required',
  story_not_found: 'story_not_found',
  story_required: 'story_required',
  no_active_round: 'no_active_round',
  round_in_progress: 'round_in_progress',
  round_already_revealed: 'round_already_revealed',
  observers_cannot_vote: 'observers_cannot_vote',
  not_in_audience: 'not_in_audience',
  invalid_card: 'invalid_card',
  reveal_before_close: 'reveal_before_close',
  consensus_required: 'consensus_required',
  no_estimation_to_save: 'no_estimation_to_save',
  moderator_in_room: 'moderator_in_room',
  moderator_only: 'moderator_only',
  session_invalid: 'session_invalid',
  not_authenticated: 'not_authenticated',
  not_connected: 'not_connected',
  unsupported_action: 'unsupported_action',
  create_room_failed: 'create_room_failed',
  network_error: 'network_error',
  copy_link_failed: 'copy_link_failed',
  transfer_target_required: 'transfer_target_required'
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const ERROR_CODE_SET = new Set<string>(Object.values(ERROR_CODES));

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && ERROR_CODE_SET.has(value);
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export const ERROR_MESSAGES_EN: Record<ErrorCode, string> = {
  display_name_required: 'Please choose a display name',
  room_name_required: 'Please choose a room name',
  room_name_empty: 'Room name cannot be empty',
  password_required: 'Private rooms require a password',
  password_incorrect: 'Incorrect password',
  room_not_found: 'Room not found',
  room_unavailable: 'Room unavailable',
  room_closed: 'The room is closed',
  invalid_message: 'Invalid message',
  connection_error: 'Connection error',
  internal_error: 'Internal error',
  player_not_found: 'Participant not found',
  player_not_connected: 'The participant must be connected',
  player_name_required: 'Please choose a name',
  player_name_taken: 'That name is already in use',
  cannot_remove_self: 'You cannot remove yourself',
  team_name_required: 'Team name is required',
  team_exists: 'A team with that name already exists',
  team_not_found: 'Team not found',
  team_name_invalid: 'Invalid name',
  story_title_required: 'Title is required',
  story_not_found: 'Story not found',
  story_required: 'Please select a story to vote on',
  no_active_round: 'No active round',
  round_in_progress: 'Finish or cancel the current round before changing story',
  round_already_revealed: 'The round has already been revealed',
  observers_cannot_vote: 'Observers cannot vote',
  not_in_audience: 'You are not in the audience for this round',
  invalid_card: 'Invalid card',
  reveal_before_close: 'You must reveal before closing',
  consensus_required: 'Please select a consensus estimation',
  no_estimation_to_save: 'No estimation to save',
  moderator_in_room: 'The Moderator is still in the room',
  moderator_only: 'Only the Moderator can perform this action',
  session_invalid: 'Invalid session',
  not_authenticated: 'Not authenticated',
  not_connected: 'Not connected',
  unsupported_action: 'Unsupported action',
  create_room_failed: 'Could not create the room',
  network_error: 'Network error while creating the room',
  copy_link_failed: 'Could not copy the link',
  transfer_target_required: 'Please choose who to transfer the Moderator role to'
};
