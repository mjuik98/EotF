import {
  appendEnemySelectionLabel,
  applyEnemyDeadState,
  renderEnemyHealthSection,
  renderEnemyIntentNode,
  syncEnemyPreviewState,
  syncEnemySelectionState,
} from './combat_enemy_card_renderers_ui.js';

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
    appendEnemySelectionLabel(card, doc, selectedMarkerText);
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

  renderEnemyHealthSection({ card, doc, index, enemy, hpPct, hpBarBackground });

  const hpTextEl = doc.createElement('div');
  hpTextEl.id = `enemy_hptext_${index}`;
  hpTextEl.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text-dim);";
  hpTextEl.textContent = hpText;
  card.appendChild(hpTextEl);

  const intentEl = doc.createElement('div');
  intentEl.id = `enemy_intent_${index}`;
  intentEl.className = 'enemy-intent';
  renderEnemyIntentNode({
    intentEl,
    doc,
    intentIcon,
    intentLabelHtml,
    intentDmgVal,
    combinedLabelHtml: `${intentIcon} ${intentLabelHtml}`,
  });
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
    renderEnemyIntentNode({
      intentEl,
      doc,
      intentIcon,
      intentLabelHtml,
      intentDmgVal,
    });
    intentEl.onmouseenter = onIntentEnter;
    intentEl.onmouseleave = onIntentLeave;
  }

  if (statusEl) {
    statusEl.textContent = '';
    statusEl.appendChild(statusFragment);
  }

  if (!card) return;

  if (enemy.hp <= 0) {
    applyEnemyDeadState(card);
  }

  if (enemy.hp > 0) {
    syncEnemySelectionState({ card, doc, isSelected, selectedMarkerText });
    syncEnemyPreviewState({ card, doc, previewText });
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
    applyEnemyDeadState(card);
  }
}
