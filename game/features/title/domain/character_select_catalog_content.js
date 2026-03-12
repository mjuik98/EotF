import { CLASS_METADATA } from '../../../../data/class_metadata.js';
import { ITEMS } from '../../../../data/items.js';

function resolveParticle(classMeta) {
  if (classMeta.class === 'berserker') return 'rage';
  if (classMeta.class === 'guardian') return 'aegis';
  return classMeta.particle;
}

function resolveStartRelic(classMeta) {
  const relic = ITEMS[classMeta.startRelic];
  if (!relic) {
    return {
      icon: '?',
      name: classMeta.startRelic || 'Unknown Relic',
      desc: 'Data unavailable',
      passive: 'No passive info',
    };
  }

  return {
    icon: relic.icon || '?',
    name: relic.name || classMeta.startRelic,
    desc: relic.desc || 'Data unavailable',
    passive: relic.passive || 'No passive info',
  };
}

export const CHARACTER_SELECT_CHARS = Object.values(CLASS_METADATA)
  .slice()
  .sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0))
  .map((classMeta) => ({
    ...classMeta,
    particle: resolveParticle(classMeta),
    startRelic: resolveStartRelic(classMeta),
  }));
