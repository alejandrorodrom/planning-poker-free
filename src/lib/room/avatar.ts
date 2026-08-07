export type AvatarOption = { id: string; label: string };

export type PlayerAvatarConfig = {
  top: string;
  clothes: string;
  clothesGraphic: string;
  facialHair: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  accessories: string;
  hairColor: string;
  clothesColor: string;
  skinColor: string;
  facialHairColor: string;
  hatColor: string;
  accessoriesColor: string;
};

function opts(ids: string[], labels: Record<string, string> = {}): AvatarOption[] {
  return ids.map((id) => ({ id, label: labels[id] ?? id }));
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export const HAT_TOPS = new Set([
  'hat',
  'hijab',
  'turban',
  'winterHat1',
  'winterHat02',
  'winterHat03',
  'winterHat04'
]);

export function isCostumeTop(top: string): boolean {
  return HAT_TOPS.has(top);
}

const ALL_TOPS = new Set([
  'bigHair',
  'bob',
  'bun',
  'curly',
  'curvy',
  'dreads',
  'dreads01',
  'dreads02',
  'frida',
  'frizzle',
  'fro',
  'froBand',
  'hat',
  'hijab',
  'longButNotTooLong',
  'miaWallace',
  'shaggy',
  'shaggyMullet',
  'shavedSides',
  'shortCurly',
  'shortFlat',
  'shortRound',
  'shortWaved',
  'sides',
  'straight01',
  'straight02',
  'straightAndStrand',
  'theCaesar',
  'theCaesarAndSidePart',
  'turban',
  'winterHat1',
  'winterHat02',
  'winterHat03',
  'winterHat04'
]);

const ALL_CLOTHES = new Set([
  'blazerAndShirt',
  'blazerAndSweater',
  'collarAndSweater',
  'graphicShirt',
  'hoodie',
  'overall',
  'shirtCrewNeck',
  'shirtScoopNeck',
  'shirtVNeck'
]);

const ALL_GRAPHICS = new Set([
  'bat',
  'bear',
  'cumbia',
  'deer',
  'diamond',
  'hola',
  'pizza',
  'resist',
  'skull',
  'skullOutline'
]);

const ALL_FACIAL = new Set([
  'none',
  'beardLight',
  'beardMedium',
  'beardMajestic',
  'moustacheFancy',
  'moustacheMagnum'
]);

const ALL_EYES = new Set([
  'closed',
  'cry',
  'default',
  'eyeRoll',
  'happy',
  'hearts',
  'side',
  'squint',
  'surprised',
  'wink',
  'winkWacky',
  'xDizzy'
]);

const ALL_EYEBROWS = new Set([
  'angry',
  'angryNatural',
  'default',
  'defaultNatural',
  'flatNatural',
  'frownNatural',
  'raisedExcited',
  'raisedExcitedNatural',
  'sadConcerned',
  'sadConcernedNatural',
  'unibrowNatural',
  'upDown',
  'upDownNatural'
]);

const ALL_MOUTHS = new Set([
  'concerned',
  'default',
  'disbelief',
  'eating',
  'grimace',
  'sad',
  'screamOpen',
  'serious',
  'smile',
  'tongue',
  'twinkle',
  'vomit'
]);

const ALL_ACCESSORIES = new Set([
  'none',
  'eyepatch',
  'kurt',
  'prescription01',
  'prescription02',
  'round',
  'sunglasses',
  'wayfarers'
]);

export const AVATAR_TOPS = opts(
  [
    'shortFlat',
    'shortRound',
    'shortCurly',
    'shortWaved',
    'theCaesar',
    'theCaesarAndSidePart',
    'sides',
    'shavedSides',
    'bob',
    'bun',
    'longButNotTooLong',
    'miaWallace',
    'straight01',
    'straight02',
    'straightAndStrand',
    'curly',
    'curvy',
    'frizzle',
    'shaggy',
    'shaggyMullet',
    'bigHair',
    'fro',
    'froBand',
    'dreads',
    'dreads01',
    'dreads02',
    'frida'
  ],
  {
    shortFlat: 'Cepillo',
    shortRound: 'Corto',
    shortCurly: 'Rizado corto',
    shortWaved: 'Ondas cortas',
    theCaesar: 'César',
    theCaesarAndSidePart: 'César con raya',
    sides: 'Laterales',
    shavedSides: 'Lados rapados',
    bob: 'Bob',
    bun: 'Recogido',
    longButNotTooLong: 'Melena',
    miaWallace: 'Flequillo',
    straight01: 'Liso 1',
    straight02: 'Liso 2',
    straightAndStrand: 'Liso con mechón',
    curly: 'Rizado',
    curvy: 'Ondulado',
    frizzle: 'Rulos',
    shaggy: 'Despeinado',
    shaggyMullet: 'Mullet',
    bigHair: 'Voluminoso',
    fro: 'Afro',
    froBand: 'Afro con cinta',
    dreads: 'Rastas',
    dreads01: 'Rastas 1',
    dreads02: 'Rastas 2',
    frida: 'Frida'
  }
);

export const AVATAR_COSTUMES = opts(
  ['none', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat02', 'winterHat03', 'winterHat04'],
  {
    none: 'Sin disfraz',
    hat: 'Sombrero',
    hijab: 'Hiyab',
    turban: 'Turbante',
    winterHat1: 'Gorro',
    winterHat02: 'Gorro 2',
    winterHat03: 'Gorro 3',
    winterHat04: 'Gorro 4'
  }
);

export const AVATAR_CLOTHES = opts(
  [
    'shirtCrewNeck',
    'shirtVNeck',
    'shirtScoopNeck',
    'hoodie',
    'blazerAndShirt',
    'blazerAndSweater',
    'collarAndSweater',
    'overall',
    'graphicShirt'
  ],
  {
    shirtCrewNeck: 'Cuello redondo',
    shirtVNeck: 'Cuello en V',
    shirtScoopNeck: 'Escote',
    hoodie: 'Hoodie',
    blazerAndShirt: 'Blazer y camisa',
    blazerAndSweater: 'Blazer y suéter',
    collarAndSweater: 'Cuello y suéter',
    overall: 'Overall',
    graphicShirt: 'Estampada'
  }
);

export const AVATAR_CLOTHES_GRAPHICS = opts(
  ['bat', 'bear', 'cumbia', 'deer', 'diamond', 'hola', 'pizza', 'resist', 'skull', 'skullOutline'],
  {
    bat: 'Murciélago',
    bear: 'Oso',
    cumbia: 'Cumbia',
    deer: 'Ciervo',
    diamond: 'Diamante',
    hola: 'Hola',
    pizza: 'Pizza',
    resist: 'Resist',
    skull: 'Calavera',
    skullOutline: 'Calavera outline'
  }
);

export const AVATAR_FACIAL_HAIR = opts(
  ['none', 'beardLight', 'beardMedium', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
  {
    none: 'Ninguno',
    beardLight: 'Barba ligera',
    beardMedium: 'Barba media',
    beardMajestic: 'Barba completa',
    moustacheFancy: 'Bigote fino',
    moustacheMagnum: 'Bigote grueso'
  }
);

export const AVATAR_EYES = opts(
  [
    'default',
    'happy',
    'wink',
    'winkWacky',
    'squint',
    'side',
    'closed',
    'surprised',
    'eyeRoll',
    'cry',
    'hearts',
    'xDizzy'
  ],
  {
    default: 'Normal',
    happy: 'Felices',
    wink: 'Guiño',
    winkWacky: 'Guiño loco',
    squint: 'Entrecerrados',
    side: 'De lado',
    closed: 'Cerrados',
    surprised: 'Sorprendidos',
    eyeRoll: 'Rodando',
    cry: 'Llorando',
    hearts: 'Corazones',
    xDizzy: 'Mareados'
  }
);

export const AVATAR_EYEBROWS = opts(
  [
    'default',
    'defaultNatural',
    'raisedExcited',
    'raisedExcitedNatural',
    'flatNatural',
    'frownNatural',
    'angry',
    'angryNatural',
    'sadConcerned',
    'sadConcernedNatural',
    'upDown',
    'upDownNatural',
    'unibrowNatural'
  ],
  {
    default: 'Normal',
    defaultNatural: 'Natural',
    raisedExcited: 'Levantadas',
    raisedExcitedNatural: 'Levantadas natural',
    flatNatural: 'Planas',
    frownNatural: 'Ceño',
    angry: 'Enojadas',
    angryNatural: 'Enojadas natural',
    sadConcerned: 'Tristes',
    sadConcernedNatural: 'Tristes natural',
    upDown: 'Arriba/abajo',
    upDownNatural: 'Arriba/abajo natural',
    unibrowNatural: 'Uniceja'
  }
);

export const AVATAR_MOUTHS = opts(
  [
    'smile',
    'default',
    'serious',
    'twinkle',
    'concerned',
    'disbelief',
    'sad',
    'grimace',
    'eating',
    'tongue',
    'screamOpen',
    'vomit'
  ],
  {
    smile: 'Sonrisa',
    default: 'Normal',
    serious: 'Seria',
    twinkle: 'Pícaro',
    concerned: 'Preocupada',
    disbelief: 'Incrédula',
    sad: 'Triste',
    grimace: 'Mueca',
    eating: 'Comiendo',
    tongue: 'Lengua',
    screamOpen: 'Gritando',
    vomit: 'Náuseas'
  }
);

export const AVATAR_ACCESSORIES = opts(
  ['none', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers', 'eyepatch', 'kurt'],
  {
    none: 'Sin lentes',
    prescription01: 'Lentes 1',
    prescription02: 'Lentes 2',
    round: 'Lentes redondos',
    sunglasses: 'Lentes de sol',
    wayfarers: 'Wayfarers',
    eyepatch: 'Parche',
    kurt: 'Kurt'
  }
);

export const HAIR_COLORS = opts(
  [
    '#a55728',
    '#2c1b18',
    '#b58143',
    '#d6b370',
    '#724133',
    '#4a312c',
    '#f59797',
    '#ecdcbf',
    '#c93305',
    '#e8e1e1'
  ],
  {
    '#a55728': 'Cobrizo',
    '#2c1b18': 'Negro',
    '#b58143': 'Rubio oscuro',
    '#d6b370': 'Rubio',
    '#724133': 'Castaño',
    '#4a312c': 'Castaño oscuro',
    '#f59797': 'Rosa',
    '#ecdcbf': 'Rubio claro',
    '#c93305': 'Pelirrojo',
    '#e8e1e1': 'Gris'
  }
);

export const FACIAL_HAIR_COLORS = HAIR_COLORS;

export const CLOTHES_COLORS = opts(
  [
    '#262e33',
    '#65c9ff',
    '#5199e4',
    '#25557c',
    '#e6e6e6',
    '#929598',
    '#3c4f5c',
    '#b1e2ff',
    '#a7ffc4',
    '#ffdeb5',
    '#ffafb9',
    '#ffffb1',
    '#ff488e',
    '#ff5c5c',
    '#ffffff'
  ],
  {
    '#262e33': 'Negro',
    '#65c9ff': 'Celeste',
    '#5199e4': 'Azul',
    '#25557c': 'Azul oscuro',
    '#e6e6e6': 'Gris claro',
    '#929598': 'Gris',
    '#3c4f5c': 'Grafito',
    '#b1e2ff': 'Azul pastel',
    '#a7ffc4': 'Menta',
    '#ffdeb5': 'Beige',
    '#ffafb9': 'Rosado',
    '#ffffb1': 'Amarillo',
    '#ff488e': 'Rosa',
    '#ff5c5c': 'Rojo',
    '#ffffff': 'Blanco'
  }
);

export const HAT_COLORS = CLOTHES_COLORS;
export const ACCESSORIES_COLORS = CLOTHES_COLORS;

export const SKIN_COLORS = opts(
  ['#614335', '#d08b5b', '#ae5d29', '#edb98a', '#ffdbb4', '#fd9841', '#f8d25c'],
  {
    '#614335': 'Oscura',
    '#d08b5b': 'Media',
    '#ae5d29': 'Morena',
    '#edb98a': 'Media clara',
    '#ffdbb4': 'Clara',
    '#fd9841': 'Dorada',
    '#f8d25c': 'Ámbar'
  }
);

export const DEFAULT_AVATAR: PlayerAvatarConfig = {
  top: 'shortFlat',
  clothes: 'shirtCrewNeck',
  clothesGraphic: 'pizza',
  facialHair: 'none',
  eyes: 'default',
  eyebrows: 'default',
  mouth: 'smile',
  accessories: 'none',
  hairColor: '#2c1b18',
  clothesColor: '#25557c',
  skinColor: '#d08b5b',
  facialHairColor: '#2c1b18',
  hatColor: '#25557c',
  accessoriesColor: '#262e33'
};

const HAIR_COLOR_SET = new Set(HAIR_COLORS.map((o) => o.id));
const CLOTHES_COLOR_SET = new Set(CLOTHES_COLORS.map((o) => o.id));
const SKIN_COLOR_SET = new Set(SKIN_COLORS.map((o) => o.id));
const HAT_COLOR_SET = new Set(HAT_COLORS.map((o) => o.id));
const ACCESSORIES_COLOR_SET = new Set(ACCESSORIES_COLORS.map((o) => o.id));

const AVATAR_STORAGE_KEY = 'ppf:avatar';

function pick(value: unknown, allowed: Set<string>, fallback: string): string {
  return typeof value === 'string' && allowed.has(value) ? value : fallback;
}

function normalizeHex(value: unknown, fallback: string, allowed: Set<string>): string {
  if (typeof value !== 'string') return fallback;
  const hex = value.startsWith('#') ? value.toLowerCase() : `#${value.toLowerCase()}`;
  return allowed.has(hex) ? hex : fallback;
}

function isLegacyAvatar(raw: Record<string, unknown>): boolean {
  if (typeof raw.hair === 'string' && typeof raw.top !== 'string') return true;
  if (typeof raw.body === 'string' && typeof raw.eyes !== 'string') return true;
  return false;
}

export function sanitizeAvatar(input: unknown): PlayerAvatarConfig {
  if (!input || typeof input !== 'object') return { ...DEFAULT_AVATAR };
  const raw = input as Record<string, unknown>;
  if (isLegacyAvatar(raw)) return { ...DEFAULT_AVATAR };

  return {
    top: pick(raw.top, ALL_TOPS, DEFAULT_AVATAR.top),
    clothes: pick(raw.clothes, ALL_CLOTHES, DEFAULT_AVATAR.clothes),
    clothesGraphic: pick(raw.clothesGraphic, ALL_GRAPHICS, DEFAULT_AVATAR.clothesGraphic),
    facialHair: pick(raw.facialHair, ALL_FACIAL, DEFAULT_AVATAR.facialHair),
    eyes: pick(raw.eyes, ALL_EYES, DEFAULT_AVATAR.eyes),
    eyebrows: pick(raw.eyebrows, ALL_EYEBROWS, DEFAULT_AVATAR.eyebrows),
    mouth: pick(raw.mouth, ALL_MOUTHS, DEFAULT_AVATAR.mouth),
    accessories: pick(raw.accessories, ALL_ACCESSORIES, DEFAULT_AVATAR.accessories),
    hairColor: normalizeHex(raw.hairColor, DEFAULT_AVATAR.hairColor, HAIR_COLOR_SET),
    clothesColor: normalizeHex(
      raw.clothesColor ?? raw.poloColor,
      DEFAULT_AVATAR.clothesColor,
      CLOTHES_COLOR_SET
    ),
    skinColor: normalizeHex(raw.skinColor, DEFAULT_AVATAR.skinColor, SKIN_COLOR_SET),
    facialHairColor: normalizeHex(
      raw.facialHairColor ?? raw.hairColor,
      DEFAULT_AVATAR.facialHairColor,
      HAIR_COLOR_SET
    ),
    hatColor: normalizeHex(raw.hatColor ?? raw.clothesColor, DEFAULT_AVATAR.hatColor, HAT_COLOR_SET),
    accessoriesColor: normalizeHex(
      raw.accessoriesColor,
      DEFAULT_AVATAR.accessoriesColor,
      ACCESSORIES_COLOR_SET
    )
  };
}

export function randomAvatar(): PlayerAvatarConfig {
  const costumeOptions = AVATAR_COSTUMES.filter((o) => o.id !== 'none');
  const useCostume = Math.random() < 0.28;
  const top = useCostume ? pickRandom(costumeOptions).id : pickRandom(AVATAR_TOPS).id;
  const facialHair = pickRandom(AVATAR_FACIAL_HAIR).id;
  const accessories = pickRandom(AVATAR_ACCESSORIES).id;
  const hairColor = pickRandom(HAIR_COLORS).id;
  const clothesColor = pickRandom(CLOTHES_COLORS).id;

  return sanitizeAvatar({
    top,
    clothes: pickRandom(AVATAR_CLOTHES).id,
    clothesGraphic: pickRandom(AVATAR_CLOTHES_GRAPHICS).id,
    facialHair,
    eyes: pickRandom(AVATAR_EYES).id,
    eyebrows: pickRandom(AVATAR_EYEBROWS).id,
    mouth: pickRandom(AVATAR_MOUTHS).id,
    accessories,
    hairColor,
    clothesColor,
    skinColor: pickRandom(SKIN_COLORS).id,
    facialHairColor: hairColor,
    hatColor: clothesColor,
    accessoriesColor: pickRandom(ACCESSORIES_COLORS).id
  });
}

export function loadStoredAvatar(): PlayerAvatarConfig {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_AVATAR };
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AVATAR };
    return sanitizeAvatar(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AVATAR };
  }
}

export function saveStoredAvatar(avatar: PlayerAvatarConfig): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(sanitizeAvatar(avatar)));
  } catch {
    /* ignore */
  }
}
