import { t } from '$lib/i18n';
import type { DeckId } from './decks';
import type { StoryStatus } from './protocol';

export function deckLabel(deckId: DeckId): string {
  return t(`decks.${deckId}`);
}

export function storyStatusLabel(status: StoryStatus | string): string {
  switch (status) {
    case 'pending':
      return t('storyStatus.pending');
    case 'voting':
      return t('storyStatus.voting');
    case 'estimated':
      return t('storyStatus.estimated');
    case 'skipped':
      return t('storyStatus.skipped');
    default:
      return status;
  }
}
