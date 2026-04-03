import {
  ensureCharacterCardLoadoutStatusNode,
  ensureCharacterCardProgressNodes,
  ensureCharacterCardVisualNodes,
} from './character_select_card_nodes.js';
import {
  applyCharacterCardVisualStyles,
  renderCharacterCardCorners,
} from './character_select_card_visual_styles.js';

export {
  ensureCharacterCardLoadoutStatusNode,
  ensureCharacterCardProgressNodes,
  ensureCharacterCardVisualNodes,
} from './character_select_card_nodes.js';
export {
  applyCharacterCardVisualStyles,
  renderCharacterCardCorners,
} from './character_select_card_visual_styles.js';

export function renderCharacterCard({
  card,
  selectedChar,
  classProgress,
  maxLevel,
  resolveById,
  doc,
  traitBadgeText,
  summaryText,
  loadoutSummaryText,
  loadoutWarningText,
} = {}) {
  if (!card || !selectedChar || !resolveById) return;

  const visualNodes = ensureCharacterCardVisualNodes(card, doc);
  const { isMax } = applyCharacterCardVisualStyles({
    card,
    selectedChar,
    classProgress,
    maxLevel,
    resolveById,
    visualNodes,
    summaryText,
    traitBadgeText,
  });

  const progressNodes = ensureCharacterCardProgressNodes(card, doc);
  if (progressNodes.badge) {
    progressNodes.badge.textContent = isMax ? 'MAX' : `Lv.${classProgress.level}`;
    progressNodes.badge.style.color = selectedChar.accent;
    progressNodes.badge.style.borderColor = `${selectedChar.accent}${isMax ? 'bb' : '66'}`;
    progressNodes.badge.style.background = isMax ? `${selectedChar.accent}26` : `${selectedChar.accent}14`;
    progressNodes.badge.style.boxShadow = `0 0 18px ${selectedChar.glow}22`;
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

  renderCharacterCardCorners(card, doc, selectedChar.accent);
}
