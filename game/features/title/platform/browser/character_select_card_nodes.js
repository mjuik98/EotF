export function ensureCharacterCardProgressNodes(card, doc = document) {
  if (!card || !doc?.createElement) {
    return { badge: null };
  }

  let badge = card.querySelector?.('#cardLevelBadge');
  if (!badge) {
    badge = doc.createElement('div');
    badge.id = 'cardLevelBadge';
    badge.innerHTML = '<div class="csm-card-level"></div>';
    const cardName = card.querySelector?.('#cardName');
    if (typeof card.insertBefore === 'function' && cardName) {
      card.insertBefore(badge, cardName);
    } else {
      card.appendChild?.(badge);
    }
  }

  return {
    badge: badge.querySelector?.('.csm-card-level') || null,
  };
}

export function ensureCharacterCardLoadoutStatusNode(card, doc = document) {
  if (!card || !doc?.createElement) return null;

  let status = card.querySelector?.('#cardLoadoutStatus');
  if (!status) {
    status = doc.createElement('div');
    status.id = 'cardLoadoutStatus';
    status.innerHTML = `
      <div class="csm-card-loadout-summary"></div>
      <div class="csm-card-loadout-warning"></div>
    `;
    card.appendChild?.(status);
  }
  return status;
}

export function ensureCharacterCardVisualNodes(card, doc = document) {
  if (!card || !doc?.createElement) {
    return { orbit: null, sigil: null, pedestal: null };
  }

  function ensureNode(id, className) {
    let node = card.querySelector?.(`#${id}`);
    if (!node) {
      node = doc.createElement('div');
      node.id = id;
      node.className = className;
      card.appendChild?.(node);
    }
    return node;
  }

  return {
    orbit: ensureNode('cardVisualOrbit', 'csm-card-visual csm-card-visual--orbit'),
    sigil: ensureNode('cardVisualSigil', 'csm-card-visual csm-card-visual--sigil'),
    pedestal: ensureNode('cardVisualPedestal', 'csm-card-visual csm-card-visual--pedestal'),
  };
}
