import { ROLE_LABEL_MAX, sanitizeBounded } from './limits';

export const MODERATOR_LABELS = ['Moderador', 'Moderator'] as const;

export function isModeratorLabel(label?: string | null): boolean {
  if (!label) return false;
  const trimmed = label.trim().toLowerCase();
  return MODERATOR_LABELS.some((reserved) => reserved.toLowerCase() === trimmed);
}

export function sanitizeRoleLabel(label?: string | null): string | undefined {
  if (!label) return undefined;
  const trimmed = sanitizeBounded(label, ROLE_LABEL_MAX);
  if (!trimmed) return undefined;
  if (isModeratorLabel(trimmed)) return undefined;
  return trimmed;
}
