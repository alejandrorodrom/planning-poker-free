import { DEFAULT_DECK, isDeckId, type DeckId } from './decks';
import {
  isEstimateRule,
  isRevealMode,
  type EstimateRule,
  type RevealMode
} from './protocol';

export type CreateRoomConfigInput = {
  deck?: unknown;
  estimateRule?: unknown;
  revealMode?: unknown;
  autoRevealOnTimerEnd?: boolean;
  defaultTimerSeconds?: number | null;
};

export type NormalizedCreateRoomConfig = {
  deck: DeckId;
  estimateRule: EstimateRule;
  revealMode: RevealMode;
  autoRevealOnTimerEnd: boolean;
  defaultTimerSeconds: number;
};

export function normalizeCreateRoomConfig(
  input: CreateRoomConfigInput
): NormalizedCreateRoomConfig {
  return {
    deck: isDeckId(input.deck) ? input.deck : DEFAULT_DECK,
    estimateRule: isEstimateRule(input.estimateRule) ? input.estimateRule : 'consensus',
    revealMode: isRevealMode(input.revealMode) ? input.revealMode : 'hidden',
    autoRevealOnTimerEnd: input.autoRevealOnTimerEnd !== false,
    defaultTimerSeconds:
      typeof input.defaultTimerSeconds === 'number' ? input.defaultTimerSeconds : 60
  };
}
