export function ensureCharacterCardProgressNodes(card, doc = document) {
  if (!card || !doc?.createElement) {
    return { badge: null, xpFill: null, xpText: null };
  }

  let badge = card.querySelector?.('#cardLevelBadge');
  if (!badge) {
    badge = doc.createElement('div');
    badge.id = 'cardLevelBadge';
    badge.innerHTML = '<div class="csm-card-level"></div>';
    card.appendChild?.(badge);
  }

  let xpWrap = card.querySelector?.('#cardXpBarWrap');
  if (!xpWrap) {
    xpWrap = doc.createElement('div');
    xpWrap.id = 'cardXpBarWrap';
    xpWrap.innerHTML = `
      <div class="csm-card-xp-track"><div class="csm-card-xp-fill"></div></div>
      <div class="csm-card-xp-text"></div>
    `;
    card.appendChild?.(xpWrap);
  }

  return {
    badge: badge.querySelector?.('.csm-card-level') || null,
    xpFill: xpWrap.querySelector?.('.csm-card-xp-fill') || null,
    xpText: xpWrap.querySelector?.('.csm-card-xp-text') || null,
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

export function renderCharacterCard({
  card,
  selectedChar,
  classProgress,
  maxLevel,
  resolveById,
  doc,
  traitBadgeText,
  summaryText,
  xpText,
  loadoutSummaryText,
  loadoutWarningText,
} = {}) {
  if (!card || !selectedChar || !resolveById) return;

  const isMax = classProgress.level >= maxLevel;
  card.classList?.toggle?.('csm-max', isMax);
  card.style.setProperty?.('--char-accent', selectedChar.accent);
  card.style.setProperty?.('--char-color', selectedChar.color);
  card.style.setProperty?.('--char-glow', selectedChar.glow);
  card.style.border = isMax
    ? `1.6px solid ${selectedChar.accent}aa`
    : `1px solid ${selectedChar.accent}44`;
  card.style.background = isMax
    ? `linear-gradient(158deg,${selectedChar.color}2d 0%,#080610 48%,${selectedChar.color}18 100%)`
    : `linear-gradient(158deg,${selectedChar.color}18 0%,#060610 50%,${selectedChar.color}08 100%)`;
  card.style.boxShadow = isMax
    ? `0 0 80px ${selectedChar.glow}44,inset 0 1px 0 ${selectedChar.accent}33`
    : `0 0 65px ${selectedChar.glow}22,inset 0 1px 0 ${selectedChar.accent}18`;

  const visualNodes = ensureCharacterCardVisualNodes(card, doc);
  if (visualNodes.orbit) {
    visualNodes.orbit.style.borderColor = `${selectedChar.accent}30`;
    visualNodes.orbit.style.boxShadow = `0 0 28px ${selectedChar.glow}22,inset 0 0 16px ${selectedChar.accent}10`;
  }
  if (visualNodes.sigil) {
    visualNodes.sigil.style.background = `
      radial-gradient(circle at 50% 45%, ${selectedChar.accent}30 0%, ${selectedChar.accent}12 28%, transparent 66%),
      linear-gradient(180deg, ${selectedChar.accent}10 0%, transparent 70%)
    `;
    visualNodes.sigil.style.borderColor = `${selectedChar.accent}2f`;
    visualNodes.sigil.style.boxShadow = `0 0 60px ${selectedChar.glow}18`;
  }
  if (visualNodes.pedestal) {
    visualNodes.pedestal.style.background = `
      radial-gradient(circle at 50% 50%, ${selectedChar.accent}26 0%, ${selectedChar.accent}0d 42%, transparent 78%)
    `;
  }

  const cardTitle = resolveById('cardTitle');
  if (cardTitle) {
    cardTitle.style.color = selectedChar.accent;
    cardTitle.style.position = 'relative';
    cardTitle.style.zIndex = '2';
    cardTitle.style.fontSize = '11px';
    cardTitle.style.letterSpacing = '0.42em';
    cardTitle.style.textTransform = 'uppercase';
    cardTitle.style.marginBottom = '14px';
    cardTitle.style.opacity = '0.92';
    cardTitle.textContent = selectedChar.title;
  }

  const cardEmoji = resolveById('cardEmoji');
  if (cardEmoji) {
    cardEmoji.textContent = selectedChar.emoji;
    cardEmoji.style.position = 'relative';
    cardEmoji.style.zIndex = '2';
    cardEmoji.style.fontSize = 'clamp(86px, 12vw, 132px)';
    cardEmoji.style.lineHeight = '1';
    cardEmoji.style.marginBottom = '18px';
    cardEmoji.style.filter = `drop-shadow(0 0 34px ${selectedChar.glow})`;
    cardEmoji.style.textShadow = `0 0 24px ${selectedChar.glow}`;
  }

  const cardName = resolveById('cardName');
  if (cardName) {
    cardName.textContent = selectedChar.name;
    cardName.style.position = 'relative';
    cardName.style.zIndex = '2';
    cardName.style.fontSize = 'clamp(28px, 3.6vw, 40px)';
    cardName.style.lineHeight = '1.06';
    cardName.style.letterSpacing = '0.08em';
    cardName.style.marginBottom = '10px';
    cardName.style.textShadow = `0 0 20px ${selectedChar.glow}`;
  }

  const cardSummary = resolveById('cardSummary');
  if (cardSummary) {
    cardSummary.textContent = summaryText || '';
    cardSummary.style.color = '#d8e4f5';
  }

  const cardDiff = resolveById('cardDiff');
  if (cardDiff) {
    cardDiff.style.position = 'relative';
    cardDiff.style.zIndex = '2';
    cardDiff.style.fontSize = '12px';
    cardDiff.style.letterSpacing = '0.16em';
    cardDiff.style.color = '#d7e3f8';
    cardDiff.style.marginBottom = '12px';
    cardDiff.textContent = `난이도 ${selectedChar.difficulty}`;
  }

  const cardTraitBadge = resolveById('cardTraitBadge');
  if (cardTraitBadge) {
    cardTraitBadge.textContent = traitBadgeText;
    cardTraitBadge.style.position = 'relative';
    cardTraitBadge.style.zIndex = '2';
    cardTraitBadge.style.cssText += `;border:1px solid ${selectedChar.accent}44;color:${selectedChar.accent};background:${selectedChar.accent}10;margin-bottom:12px;`;
  }

  const cardTags = resolveById('cardTags');
  if (cardTags) {
    cardTags.style.position = 'relative';
    cardTags.style.zIndex = '2';
    cardTags.style.gap = '8px';
    cardTags.innerHTML = selectedChar.tags.map((tag) => (
      `<span style="padding:5px 12px;border:1px solid ${selectedChar.accent}26;border-radius:999px;font-size:11px;color:${selectedChar.accent};font-family:'Share Tech Mono',monospace;background:${selectedChar.accent}0d;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.02)">${tag}</span>`
    )).join('');
  }

  const cardBottomGrad = resolveById('cardBottomGrad');
  if (cardBottomGrad) {
    cardBottomGrad.style.background = `linear-gradient(to top,${selectedChar.color}44,transparent)`;
  }

  const cardShimmer = resolveById('cardShimmer');
  if (cardShimmer) {
    cardShimmer.style.background = `linear-gradient(105deg,transparent 40%,${selectedChar.accent}07 50%,transparent 60%)`;
  }

  const progressNodes = ensureCharacterCardProgressNodes(card, doc);
  if (progressNodes.badge) {
    progressNodes.badge.textContent = isMax ? 'MAX' : `Lv.${classProgress.level}`;
    progressNodes.badge.style.color = selectedChar.accent;
    progressNodes.badge.style.borderColor = `${selectedChar.accent}${isMax ? 'bb' : '66'}`;
    progressNodes.badge.style.background = isMax ? `${selectedChar.accent}26` : `${selectedChar.accent}14`;
  }
  if (progressNodes.xpFill) {
    progressNodes.xpFill.style.width = `${Math.round(classProgress.progress * 100)}%`;
    progressNodes.xpFill.style.background = selectedChar.accent;
    progressNodes.xpFill.style.boxShadow = `0 0 8px ${selectedChar.accent}88`;
  }
  if (progressNodes.xpText) {
    progressNodes.xpText.textContent = xpText;
  }

  const loadoutStatus = ensureCharacterCardLoadoutStatusNode(card, doc);
  const summaryNode = loadoutStatus?.querySelector?.('.csm-card-loadout-summary') || null;
  const warningNode = loadoutStatus?.querySelector?.('.csm-card-loadout-warning') || null;
  if (loadoutStatus) {
    loadoutStatus.style.marginTop = '10px';
    loadoutStatus.style.display = (loadoutSummaryText || loadoutWarningText) ? 'grid' : 'none';
    loadoutStatus.style.gap = '6px';
  }
  if (summaryNode) {
    summaryNode.textContent = loadoutSummaryText || '';
    summaryNode.style.display = loadoutSummaryText ? 'block' : 'none';
    summaryNode.style.fontSize = '11px';
    summaryNode.style.color = `${selectedChar.accent}cc`;
    summaryNode.style.fontFamily = "'Share Tech Mono',monospace";
  }
  if (warningNode) {
    warningNode.textContent = loadoutWarningText || '';
    warningNode.style.display = loadoutWarningText ? 'block' : 'none';
    warningNode.style.fontSize = '11px';
    warningNode.style.color = '#ffb347';
    warningNode.style.fontFamily = "'Share Tech Mono',monospace";
  }

  card.querySelectorAll?.('.card-corner')?.forEach((corner) => corner.remove?.());
  [
    ['top', 'left'],
    ['top', 'right'],
    ['bottom', 'left'],
    ['bottom', 'right'],
  ].forEach(([vertical, horizontal]) => {
    const corner = doc?.createElement?.('div');
    if (!corner) return;
    corner.className = 'card-corner';
    corner.style[vertical] = '9px';
    corner.style[horizontal] = '9px';
    corner.style[`border${vertical[0].toUpperCase() + vertical.slice(1)}`] = `1px solid ${selectedChar.accent}77`;
    corner.style[`border${horizontal[0].toUpperCase() + horizontal.slice(1)}`] = `1px solid ${selectedChar.accent}77`;
    card.appendChild?.(corner);
  });
}
