import type { StoryPublic } from './protocol';
import { formatEstimateLabel } from './decks';

export function storiesToMarkdown(stories: StoryPublic[]): string {
  const lines = ['# Resultados Planning Poker', ''];
  for (const story of stories) {
    const estimate = formatEstimateLabel(story.estimates.overall);
    const byTeam =
      story.estimates.byTeam
        ?.map((t) => `${t.teamName}: ${formatEstimateLabel(t.value)}`)
        .join(', ') ?? '';
    lines.push(`- **${story.title}** — ${estimate}${byTeam ? ` (${byTeam})` : ''} [${story.status}]`);
  }
  return lines.join('\n');
}

export function storiesToCsv(stories: StoryPublic[]): string {
  const rows = [['title', 'status', 'estimate', 'team_estimates']];
  for (const story of stories) {
    rows.push([
      story.title,
      story.status,
      story.estimates.overall ?? '',
      story.estimates.byTeam?.map((t) => `${t.teamName}=${t.value}`).join(';') ?? ''
    ]);
  }
  return rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
}
