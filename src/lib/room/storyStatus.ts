import type { StoryStatus } from './protocol';

export function storyStatusLabel(status: StoryStatus | string): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'voting':
      return 'Voting';
    case 'estimated':
      return 'Estimated';
    case 'skipped':
      return 'Skipped';
    default:
      return status;
  }
}
