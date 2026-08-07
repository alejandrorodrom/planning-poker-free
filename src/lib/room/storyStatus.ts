import type { StoryStatus } from './protocol';

export function storyStatusLabel(status: StoryStatus | string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'voting':
      return 'Votando';
    case 'estimated':
      return 'Estimada';
    case 'skipped':
      return 'Omitida';
    default:
      return status;
  }
}
