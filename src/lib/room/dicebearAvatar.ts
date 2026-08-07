import { Avatar, Style } from '@dicebear/core';
import definition from '@dicebear/styles/avataaars.json' with { type: 'json' };
import { sanitizeAvatar, type PlayerAvatarConfig } from '$lib/room/avatar';

const style = new Style(definition);

type DicebearOptions = ConstructorParameters<typeof Avatar>[1];

function hex(value: string): string {
  return value.replace('#', '');
}

export function avatarToDicebearOptions(config: PlayerAvatarConfig): DicebearOptions {
  const safe = sanitizeAvatar(config);
  const hasFacialHair = safe.facialHair !== 'none';
  const hasAccessories = safe.accessories !== 'none';
  const hasGraphic = safe.clothes === 'graphicShirt';

  return {
    seed: 'locked',
    size: 128,
    topVariant: [safe.top],
    topProbability: 100,
    clothesVariant: [safe.clothes],
    clothesProbability: 100,
    clothesGraphicVariant: [safe.clothesGraphic],
    clothesGraphicProbability: hasGraphic ? 100 : 0,
    facialHairVariant: hasFacialHair ? [safe.facialHair] : ['beardLight'],
    facialHairProbability: hasFacialHair ? 100 : 0,
    eyesVariant: [safe.eyes],
    eyebrowsVariant: [safe.eyebrows],
    mouthVariant: [safe.mouth],
    noseVariant: ['default'],
    accessoriesVariant: hasAccessories ? [safe.accessories] : ['round'],
    accessoriesProbability: hasAccessories ? 100 : 0,
    hairColor: [hex(safe.hairColor)],
    clothesColor: [hex(safe.clothesColor)],
    skinColor: [hex(safe.skinColor)],
    facialHairColor: [hex(safe.facialHairColor)],
    hatColor: [hex(safe.hatColor)],
    accessoriesColor: [hex(safe.accessoriesColor)]
  } as DicebearOptions;
}

export function createAvatarSvg(config: PlayerAvatarConfig, size = 128): string {
  return new Avatar(style, {
    ...avatarToDicebearOptions(config),
    size
  }).toString();
}

export function createAvatarDataUri(config: PlayerAvatarConfig, size = 128): string {
  return new Avatar(style, {
    ...avatarToDicebearOptions(config),
    size
  }).toDataUri();
}
