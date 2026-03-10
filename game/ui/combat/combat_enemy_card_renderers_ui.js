export function appendEnemySelectionLabel(card, doc, markerText = '', targetText = 'TARGET') {
  const targetLabel = doc.createElement('div');
  targetLabel.className = 'target-label-anim';
  const marker = doc.createElement('span');
  marker.textContent = markerText;
  const text = doc.createElement('span');
  text.textContent = targetText;
  targetLabel.append(marker, text);
  card.appendChild(targetLabel);
}

function renderBossPhaseSection(card, doc, index, enemy, hpPct) {
  const phaseBar = doc.createElement('div');
  phaseBar.className = 'boss-phase-bar';
  phaseBar.style.marginBottom = '2px';

  const seg = doc.createElement('div');
  seg.className = 'boss-phase-segment';
  seg.style.cssText = 'left:50%;width:50%;background:rgba(255,100,0,0.2);';

  const fill = doc.createElement('div');
  fill.id = `enemy_hpfill_${index}`;
  fill.className = 'boss-phase-fill';
  fill.style.width = `${hpPct}%`;

  phaseBar.append(seg, fill);
  card.appendChild(phaseBar);

  const phaseDots = doc.createElement('div');
  phaseDots.style.cssText = 'display:flex;gap:4px;justify-content:center;margin-bottom:2px;';
  for (let phaseIndex = 1; phaseIndex <= (enemy.maxPhase || 2); phaseIndex++) {
    const dot = doc.createElement('div');
    const isActive = phaseIndex <= (enemy.phase || 1);
    dot.style.cssText = `width:6px;height:6px;border-radius:50%;background:${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};box-shadow:${isActive ? '0 0 6px rgba(240,180,41,0.6)' : 'none'};`;
    phaseDots.appendChild(dot);
  }
  card.appendChild(phaseDots);
}

function renderHpSection(card, doc, index, hpPct, hpBarBackground) {
  const hpBar = doc.createElement('div');
  hpBar.className = 'enemy-hp-bar';
  const fill = doc.createElement('div');
  fill.id = `enemy_hpfill_${index}`;
  fill.className = 'enemy-hp-fill';
  fill.style.cssText = `width:${hpPct}%;background:${hpBarBackground};`;
  hpBar.appendChild(fill);
  card.appendChild(hpBar);
}

export function renderEnemyHealthSection({
  card,
  doc,
  index,
  enemy,
  hpPct,
  hpBarBackground,
}) {
  if (enemy.isBoss) {
    renderBossPhaseSection(card, doc, index, enemy, hpPct);
    return;
  }
  renderHpSection(card, doc, index, hpPct, hpBarBackground);
}

export function renderEnemyIntentNode({
  intentEl,
  doc,
  intentIcon,
  intentLabelHtml,
  intentDmgVal,
  combinedLabelHtml = null,
}) {
  intentEl.innerHTML = '';
  if (combinedLabelHtml) {
    const labelSpan = doc.createElement('span');
    labelSpan.innerHTML = combinedLabelHtml;
    intentEl.append(labelSpan);
  } else {
    const iconSpan = doc.createElement('span');
    iconSpan.className = 'enemy-intent-icon';
    iconSpan.textContent = intentIcon;

    const labelSpan = doc.createElement('span');
    labelSpan.className = 'enemy-intent-label';
    labelSpan.innerHTML = intentLabelHtml;

    intentEl.append(iconSpan, labelSpan);
  }

  if (intentDmgVal > 0) {
    const dmgDiv = doc.createElement('div');
    dmgDiv.className = 'enemy-intent-dmg';
    dmgDiv.textContent = intentDmgVal;
    intentEl.appendChild(dmgDiv);
  }
}

export function applyEnemyDeadState(card) {
  if (!card) return;
  card.style.opacity = '0.3';
  card.style.filter = 'grayscale(1)';
  card.style.pointerEvents = 'none';
  card.style.outline = '';
}

export function syncEnemySelectionState({
  card,
  doc,
  isSelected,
  selectedMarkerText,
}) {
  if (!card) return;
  card.classList.toggle('selected-target', isSelected);

  let labelEl = card.querySelector('.target-label-anim');
  if (isSelected) {
    if (!labelEl) {
      labelEl = doc.createElement('div');
      labelEl.className = 'target-label-anim';

      const marker = doc.createElement('span');
      marker.textContent = selectedMarkerText;
      const text = doc.createElement('span');
      text.textContent = 'TARGET';

      labelEl.append(marker, text);
      card.prepend(labelEl);
    }
    return;
  }

  labelEl?.remove();
  card.style.outline = '';
  card.style.boxShadow = '';
}

export function syncEnemyPreviewState({ card, doc, previewText }) {
  if (!card) return;
  let previewEl = card.querySelector('.enemy-dmg-preview');
  if (previewText) {
    if (!previewEl) {
      previewEl = doc.createElement('div');
      previewEl.className = 'enemy-dmg-preview';
      card.appendChild(previewEl);
    }
    previewEl.textContent = previewText;
    return;
  }
  previewEl?.remove();
}
