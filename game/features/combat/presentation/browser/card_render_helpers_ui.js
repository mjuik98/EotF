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

export function detectCardTags(card = {}) {
  const desc = card.desc || '';
  return {
    exhaust: !!(card.exhaust || /[\[【]소진[\]】]/.test(desc)),
    persistent: /[\[【]지속[\]】]/.test(desc),
    instant: /[\[【]즉시[\]】]/.test(desc),
  };
}

export function createUnifiedParticles(doc, color, options = {}) {
  const { isClone = false } = options;
  const wrap = doc.createElement('div');
  wrap.className = 'card-particles';

  const count = isClone ? 8 : 6;
  const scaleMult = isClone ? 1.8 : 1.0;
  const baseRise = isClone ? 80 : 45;

  for (let i = 0; i < count; i += 1) {
    const particle = doc.createElement('div');
    particle.className = 'card-particle';

    const size = (2 + Math.random() * 2) * scaleMult;
    const left = isClone ? (10 + Math.random() * 80) : (10 + i * 14);
    const driftX = (Math.random() * 20 - 10) * scaleMult;
    const riseY = baseRise + Math.random() * 15;

    particle.style.cssText = `
      left: ${left}%;
      bottom: ${isClone ? (15 + Math.random() * 20) : 28}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${4 * scaleMult}px ${color};
      animation-duration: ${2 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 1.5}s;
      --drift-x: ${driftX}px;
      --rise-y: ${riseY}px;
    `;
    wrap.appendChild(particle);
  }

  return wrap;
}
