import {
  applyEnemyDeadState,
  renderEnemyHealthSection,
  renderEnemyIntentNode,
  syncEnemyPreviewState,
  syncEnemySelectionState,
} from './combat_enemy_card_renderers_ui.js';
import {
  bindEnemyIntentTooltip,
  createEnemyCardShell,
  createEnemyHpTextNode,
  createEnemyIntentContainer,
  createEnemyNameNode,
  createEnemyPreviewNode,
  createEnemySpriteNode,
  createEnemyStatusContainer,
} from './combat_enemy_card_sections_ui.js';

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
  const card = createEnemyCardShell(doc, {
    enemy,
    index,
    isSelected,
    selectedMarkerText,
    onSelectTarget,
  });
  card.appendChild(createEnemySpriteNode(doc, index, spriteIcon));
  card.appendChild(createEnemyNameNode(doc, enemy));

  renderEnemyHealthSection({ card, doc, index, enemy, hpPct, hpBarBackground });
  card.appendChild(createEnemyHpTextNode(doc, index, hpText));

  const intentEl = createEnemyIntentContainer(doc, index, onIntentEnter, onIntentLeave);
  renderEnemyIntentNode({
    intentEl,
    doc,
    intentIcon,
    intentLabelHtml,
    intentDmgVal,
    combinedLabelHtml: `${intentIcon} ${intentLabelHtml}`,
  });
  card.appendChild(intentEl);
  card.appendChild(createEnemyStatusContainer(doc, index, statusFragment));

  const previewEl = createEnemyPreviewNode(doc, previewText);
  if (previewEl) card.appendChild(previewEl);

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
    bindEnemyIntentTooltip(intentEl, onIntentEnter, onIntentLeave);
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
