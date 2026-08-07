export type DeckId =
  | 'fibonacci'
  | 'fibonacci_strict'
  | 'powers_of_2'
  | 'tshirt'
  | 'sequential';

export type DeckCard = {
  value: string;
  numeric?: number;
  special?: boolean;
};

const SPECIAL: DeckCard[] = [
  { value: '?', special: true },
  { value: '☕', special: true }
];

export const DECKS: Record<
  DeckId,
  { id: DeckId; label: string; numeric: boolean; cards: DeckCard[] }
> = {
  fibonacci: {
    id: 'fibonacci',
    label: 'Fibonacci modificado',
    numeric: true,
    cards: [
      { value: '0', numeric: 0 },
      { value: '½', numeric: 0.5 },
      { value: '1', numeric: 1 },
      { value: '2', numeric: 2 },
      { value: '3', numeric: 3 },
      { value: '5', numeric: 5 },
      { value: '8', numeric: 8 },
      { value: '13', numeric: 13 },
      { value: '20', numeric: 20 },
      { value: '40', numeric: 40 },
      { value: '100', numeric: 100 },
      ...SPECIAL
    ]
  },
  fibonacci_strict: {
    id: 'fibonacci_strict',
    label: 'Fibonacci',
    numeric: true,
    cards: [
      { value: '1', numeric: 1 },
      { value: '2', numeric: 2 },
      { value: '3', numeric: 3 },
      { value: '5', numeric: 5 },
      { value: '8', numeric: 8 },
      { value: '13', numeric: 13 },
      { value: '21', numeric: 21 },
      { value: '34', numeric: 34 },
      ...SPECIAL
    ]
  },
  powers_of_2: {
    id: 'powers_of_2',
    label: 'Potencias de 2',
    numeric: true,
    cards: [
      { value: '1', numeric: 1 },
      { value: '2', numeric: 2 },
      { value: '4', numeric: 4 },
      { value: '8', numeric: 8 },
      { value: '16', numeric: 16 },
      { value: '32', numeric: 32 },
      ...SPECIAL
    ]
  },
  tshirt: {
    id: 'tshirt',
    label: 'T-shirt',
    numeric: false,
    cards: [
      { value: 'XS' },
      { value: 'S' },
      { value: 'M' },
      { value: 'L' },
      { value: 'XL' },
      { value: 'XXL' },
      ...SPECIAL
    ]
  },
  sequential: {
    id: 'sequential',
    label: 'Secuencial 0–10',
    numeric: true,
    cards: [
      { value: '0', numeric: 0 },
      { value: '1', numeric: 1 },
      { value: '2', numeric: 2 },
      { value: '3', numeric: 3 },
      { value: '4', numeric: 4 },
      { value: '5', numeric: 5 },
      { value: '6', numeric: 6 },
      { value: '7', numeric: 7 },
      { value: '8', numeric: 8 },
      { value: '9', numeric: 9 },
      { value: '10', numeric: 10 },
      ...SPECIAL
    ]
  }
};

export const DEFAULT_DECK: DeckId = 'fibonacci';

export function isDeckId(value: unknown): value is DeckId {
  return typeof value === 'string' && value in DECKS;
}

export function deckCards(deckId: DeckId): DeckCard[] {
  return DECKS[deckId].cards;
}

export function isValidCard(deckId: DeckId, value: string): boolean {
  return deckCards(deckId).some((card) => card.value === value);
}

export function isPointEstimate(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^(?:\d+|½)$/.test(value);
}

export function formatEstimateLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  if (value === '—') return value;
  return isPointEstimate(value) ? `${value} pts` : value;
}
