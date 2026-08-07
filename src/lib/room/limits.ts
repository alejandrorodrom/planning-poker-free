export const PLAYER_NAME_MAX = 24;
export const TEAM_NAME_MAX = 32;
export const ROOM_NAME_MAX = 48;
export const PASSWORD_MAX = 64;
export const STORY_TITLE_MAX = 120;
export const STORY_DESCRIPTION_MAX = 500;
export const ROLE_LABEL_MAX = 16;

export function sanitizeBounded(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

export function sanitizePlayerName(value: string | null | undefined): string {
  return sanitizeBounded(value, PLAYER_NAME_MAX);
}

export function sanitizeTeamName(value: string | null | undefined): string {
  return sanitizeBounded(value, TEAM_NAME_MAX);
}

export function sanitizeRoomName(value: string | null | undefined): string {
  return sanitizeBounded(value, ROOM_NAME_MAX);
}

export function sanitizeStoryTitle(value: string | null | undefined): string {
  return sanitizeBounded(value, STORY_TITLE_MAX);
}

export function sanitizeStoryDescription(value: string | null | undefined): string | undefined {
  const description = sanitizeBounded(value, STORY_DESCRIPTION_MAX);
  return description || undefined;
}
