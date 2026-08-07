import { DECKS, type DeckId } from './decks';
import type { EstimateRule } from './protocol';

export function computeSuggestedEstimate(
  deckId: DeckId,
  votes: Record<string, string | null>,
  rule: EstimateRule
): string | undefined {
  if (rule === 'consensus') return undefined;

  const deck = DECKS[deckId];
  const values = Object.values(votes).filter((v): v is string => typeof v === 'string' && v.length > 0);
  const usable = values.filter((value) => {
    const card = deck.cards.find((c) => c.value === value);
    return card && !card.special;
  });

  if (usable.length === 0) return undefined;

  if (rule === 'mode' || !deck.numeric) {
    return modeOf(usable, deckId);
  }

  const nums = usable
    .map((value) => {
      const card = deck.cards.find((c) => c.value === value);
      return card?.numeric;
    })
    .filter((n): n is number => typeof n === 'number');

  if (nums.length === 0) return undefined;

  if (rule === 'median') {
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
    return nearestCard(deckId, median);
  }

  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  return nearestCard(deckId, mean);
}

function modeOf(values: string[], deckId: DeckId): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0]!;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    } else if (count === bestCount) {
      const a = DECKS[deckId].cards.find((c) => c.value === best)?.numeric;
      const b = DECKS[deckId].cards.find((c) => c.value === value)?.numeric;
      if (typeof a === 'number' && typeof b === 'number') {
        if (b > a) best = value;
      } else if (value > best) {
        best = value;
      }
    }
  }
  return best;
}

function nearestCard(deckId: DeckId, target: number): string {
  const numericCards = DECKS[deckId].cards.filter(
    (c) => !c.special && typeof c.numeric === 'number'
  );
  let best = numericCards[0]!;
  let bestDist = Math.abs(best.numeric! - target);
  for (const card of numericCards.slice(1)) {
    const dist = Math.abs(card.numeric! - target);
    if (dist < bestDist || (dist === bestDist && card.numeric! > best.numeric!)) {
      best = card;
      bestDist = dist;
    }
  }
  return best.value;
}
