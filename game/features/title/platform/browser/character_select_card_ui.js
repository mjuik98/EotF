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

export function renderCharacterCard({
  card,
  selectedChar,
  classProgress,
  maxLevel,
  resolveById,
  doc,
  traitBadgeText,
  xpText,
  loadoutSummaryText,
  loadoutWarningText,
} = {}) {
  if (!card || !selectedChar || !resolveById) return;

  const isMax = classProgress.level >= maxLevel;
  card.classList?.toggle?.('csm-max', isMax);
  card.style.border = isMax
    ? `1.6px solid ${selectedChar.accent}aa`
    : `1px solid ${selectedChar.accent}44`;
  card.style.background = isMax
    ? `linear-gradient(158deg,${selectedChar.color}2d 0%,#080610 48%,${selectedChar.color}18 100%)`
    : `linear-gradient(158deg,${selectedChar.color}18 0%,#060610 50%,${selectedChar.color}08 100%)`;
  card.style.boxShadow = isMax
    ? `0 0 80px ${selectedChar.glow}44,inset 0 1px 0 ${selectedChar.accent}33`
    : `0 0 65px ${selectedChar.glow}22,inset 0 1px 0 ${selectedChar.accent}18`;

  const cardTitle = resolveById('cardTitle');
  if (cardTitle) {
    cardTitle.style.color = selectedChar.accent;
    cardTitle.textContent = selectedChar.title;
  }

  const cardEmoji = resolveById('cardEmoji');
  if (cardEmoji) {
    cardEmoji.textContent = selectedChar.emoji;
    cardEmoji.style.filter = `drop-shadow(0 0 28px ${selectedChar.glow})`;
  }

  const cardName = resolveById('cardName');
  if (cardName) {
    cardName.textContent = selectedChar.name;
    cardName.style.textShadow = `0 0 20px ${selectedChar.glow}`;
  }

  const cardDiff = resolveById('cardDiff');
  if (cardDiff) cardDiff.textContent = selectedChar.difficulty;

  const cardTraitBadge = resolveById('cardTraitBadge');
  if (cardTraitBadge) {
    cardTraitBadge.textContent = traitBadgeText;
    cardTraitBadge.style.cssText += `;border:1px solid ${selectedChar.accent}33;color:${selectedChar.accent};background:${selectedChar.accent}0a;`;
  }

  const cardTags = resolveById('cardTags');
  if (cardTags) {
    cardTags.innerHTML = selectedChar.tags.map((tag) => (
      `<span style="padding:4px 10px;border:1px solid ${selectedChar.accent}22;border-radius:12px;font-size:11px;color:${selectedChar.accent}aa;font-family:'Share Tech Mono',monospace;background:${selectedChar.accent}07">${tag}</span>`
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
