import { ROLE_LABEL_MAX, sanitizeBounded } from './limits';

export const MODERATOR_LABEL = 'Moderador';

export function sanitizeRoleLabel(label?: string | null): string | undefined {
  if (!label) return undefined;
  const trimmed = sanitizeBounded(label, ROLE_LABEL_MAX);
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === MODERATOR_LABEL.toLowerCase()) return undefined;
  return trimmed;
}
