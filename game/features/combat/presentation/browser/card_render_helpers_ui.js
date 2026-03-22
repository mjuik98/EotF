import { getCombatCardTypeLabel } from './combat_copy.js';

const CARD_RARITY_LABELS = Object.freeze({
  common: '일반',
  uncommon: '비범',
  rare: '희귀',
  legendary: '전설',
});

export function getCardTypeClass(type) {
  if (!type) return '';
  const normalized = String(type).toLowerCase();
  if (normalized === 'attack') return 'type-attack';
  if (normalized === 'skill') return 'type-skill';
  if (normalized === 'power') return 'type-power';
  return '';
}

export function getCardTypeLabelClass(type) {
  if (!type) return '';
  const normalized = String(type).toLowerCase();
  if (normalized === 'attack') return 'card-type-attack';
  if (normalized === 'skill') return 'card-type-skill';
  if (normalized === 'power') return 'card-type-power';
  return '';
}

export function getCardTypeDisplayLabel(type) {
  return getCombatCardTypeLabel(type);
}

export function getCardRarityDisplayLabel(rarity) {
  return CARD_RARITY_LABELS[String(rarity || 'common').toLowerCase()] || CARD_RARITY_LABELS.common;
}

export function detectCardTags(card = {}) {
  const desc = card.desc || '';
  return {
    exhaust: !!(card.exhaust || /[\[【]소진[\]】]/.test(desc)),
    persistent: /[\[【]지속[\]】]/.test(desc),
    instant: /[\[【]즉시[\]】]/.test(desc),
  };
}

function appendCloneAura(doc, wrap, color) {
  wrap.className = 'card-particles card-particles-aura';

  const accent = color === '#c084fc' ? '#67e8f9' : '#f8e7a1';
  const layers = [
    { className: 'card-aura card-aura-haze', style: `--aura-color: ${color}; --aura-accent: ${accent}; --aura-speed: 7.2s;` },
    { className: 'card-aura card-aura-flow', style: `--aura-color: ${color}; --aura-accent: ${accent}; --aura-speed: 5.4s;` },
    { className: 'card-aura card-aura-edge', style: `--aura-color: ${color}; --aura-accent: ${accent}; --aura-speed: 6.4s;` },
  ];

  layers.forEach(({ className, style }) => {
    const layer = doc.createElement('div');
    layer.className = className;
    layer.style.cssText = style;
    wrap.appendChild(layer);
  });
}

export function createUnifiedParticles(doc, color, options = {}) {
  const { isClone = false } = options;
  const wrap = doc.createElement('div');
  if (isClone) {
    appendCloneAura(doc, wrap, color);
    return wrap;
  }

  wrap.className = 'card-particles';

  const count = 6;
  const scaleMult = 1.0;
  const baseRise = 45;
  const delayRange = 1.5;
  const durationBase = 2;
  const durationRange = 1.5;

  for (let i = 0; i < count; i += 1) {
    const particle = doc.createElement('div');
    particle.className = 'card-particle';

    const size = (2 + Math.random() * 2) * scaleMult;
    const left = 10 + i * 14;
    const driftX = (Math.random() * 20 - 10) * scaleMult;
    const riseY = baseRise + Math.random() * 15;

    particle.style.cssText = `
      left: ${left}%;
      bottom: 28px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${4 * scaleMult}px ${color};
      mix-blend-mode: normal;
      animation-duration: ${durationBase + Math.random() * durationRange}s;
      animation-delay: ${Math.random() * delayRange}s;
      --dx: ${driftX}px;
      --ry: ${riseY}px;
    `;
    wrap.appendChild(particle);
  }

  return wrap;
}
