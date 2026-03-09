function appendSelectionLabel(card, doc, markerText = '', targetText = 'TARGET') {
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

function renderIntentNode(intentEl, doc, intentIcon, intentLabelHtml, intentDmgVal, combinedLabelHtml = null) {
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

export function createEnemyCardView({
  doc,
  enemy,
  index,
  hpPct,
  isSelected,
  hpText,
  spriteIcon,
  intentIcon,
  intentLabelHtml,
  intentDmgVal,
  statusFragment,
  previewText,
  hpBarBackground,
  selectedMarkerText,
  onSelectTarget,
  onIntentEnter,
  onIntentLeave,
}) {
  const card = doc.createElement('div');
  card.id = `enemy_${index}`;
  card.className = `enemy-card${enemy.hp <= 0 ? ' dead' : ''}${isSelected ? ' selected-target' : ''}${enemy.isBoss ? ' boss' : ''}`;

  const deadStyle = enemy.hp <= 0 ? 'opacity:0.3;filter:grayscale(1);pointer-events:none;' : '';
  const selectedStyle = isSelected ? 'outline:2px solid var(--cyan);box-shadow:0 0 18px rgba(0,255,204,0.45);' : '';
  card.style.cssText = `${deadStyle}${selectedStyle}cursor:${enemy.hp > 0 ? 'pointer' : 'default'};`;

  if (enemy.hp > 0 && typeof onSelectTarget === 'function') {
    card.addEventListener('click', onSelectTarget);
  }

  if (isSelected) {
    appendSelectionLabel(card, doc, selectedMarkerText);
  }

  const sprite = doc.createElement('div');
  sprite.id = `enemy_sprite_${index}`;
  sprite.className = 'enemy-sprite';
  const spriteIconEl = doc.createElement('span');
  spriteIconEl.style.fontSize = '64px';
  spriteIconEl.textContent = spriteIcon;
  sprite.appendChild(spriteIconEl);
  card.appendChild(sprite);

  const name = doc.createElement('div');
  name.className = 'enemy-name';
  name.textContent = enemy.name;
  if (enemy.isBoss) {
    const phase = doc.createElement('span');
    phase.style.color = 'var(--gold)';
    phase.textContent = ` P${enemy.phase || 1}`;
    name.appendChild(phase);
  }
  card.appendChild(name);

  if (enemy.isBoss) {
    renderBossPhaseSection(card, doc, index, enemy, hpPct);
  } else {
    renderHpSection(card, doc, index, hpPct, hpBarBackground);
  }

  const hpTextEl = doc.createElement('div');
  hpTextEl.id = `enemy_hptext_${index}`;
  hpTextEl.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text-dim);";
  hpTextEl.textContent = hpText;
  card.appendChild(hpTextEl);

  const intentEl = doc.createElement('div');
  intentEl.id = `enemy_intent_${index}`;
  intentEl.className = 'enemy-intent';
  renderIntentNode(intentEl, doc, intentIcon, intentLabelHtml, intentDmgVal, `${intentIcon} ${intentLabelHtml}`);
  intentEl.onmouseenter = onIntentEnter;
  intentEl.onmouseleave = onIntentLeave;
  card.appendChild(intentEl);

  const statusCont = doc.createElement('div');
  statusCont.id = `enemy_status_${index}`;
  statusCont.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;justify-content:center;margin-top:4px;';
  statusCont.appendChild(statusFragment);
  card.appendChild(statusCont);

  if (previewText) {
    const previewEl = doc.createElement('div');
    previewEl.className = 'enemy-dmg-preview';
    previewEl.textContent = previewText;
    card.appendChild(previewEl);
  }

  return card;
}

export function updateEnemyCardView({
  doc,
  enemy,
  index,
  hpPct,
  isSelected,
  hpText,
  intentIcon,
  intentLabelHtml,
  intentDmgVal,
  statusFragment,
  previewText,
  hpBarBackground,
  selectedMarkerText,
  onIntentEnter,
  onIntentLeave,
}) {
  const fill = doc.getElementById(`enemy_hpfill_${index}`);
  const txt = doc.getElementById(`enemy_hptext_${index}`);
  const intentEl = doc.getElementById(`enemy_intent_${index}`);
  const statusEl = doc.getElementById(`enemy_status_${index}`);
  const card = doc.getElementById(`enemy_${index}`);

  if (fill) {
    fill.style.width = `${hpPct}%`;
    if (!enemy.isBoss) fill.style.background = hpBarBackground;
  }
  if (txt) txt.textContent = hpText;

  if (intentEl) {
    renderIntentNode(intentEl, doc, intentIcon, intentLabelHtml, intentDmgVal);
    intentEl.onmouseenter = onIntentEnter;
    intentEl.onmouseleave = onIntentLeave;
  }

  if (statusEl) {
    statusEl.textContent = '';
    statusEl.appendChild(statusFragment);
  }

  if (!card) return;

  if (enemy.hp <= 0) {
    card.style.opacity = '0.3';
    card.style.filter = 'grayscale(1)';
    card.style.pointerEvents = 'none';
    card.style.outline = '';
  }

  if (enemy.hp > 0) {
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
    } else {
      labelEl?.remove();
      card.style.outline = '';
      card.style.boxShadow = '';
    }

    let previewEl = card.querySelector('.enemy-dmg-preview');
    if (previewText) {
      if (!previewEl) {
        previewEl = doc.createElement('div');
        previewEl.className = 'enemy-dmg-preview';
        card.appendChild(previewEl);
      }
      previewEl.textContent = previewText;
    } else {
      previewEl?.remove();
    }
  }
}

export function updateEnemyHpView({ doc, index, enemy, hpPct, hpText, hpBarBackground }) {
  const fill = doc.getElementById(`enemy_hpfill_${index}`);
  const txt = doc.getElementById(`enemy_hptext_${index}`);
  const card = doc.getElementById(`enemy_${index}`);

  if (fill) {
    fill.style.width = `${hpPct}%`;
    if (!enemy.isBoss) fill.style.background = hpBarBackground;
  }
  if (txt) txt.textContent = hpText;
  if (card && enemy.hp <= 0) {
    card.style.opacity = '0.3';
    card.style.filter = 'grayscale(1)';
    card.style.pointerEvents = 'none';
  }
}
