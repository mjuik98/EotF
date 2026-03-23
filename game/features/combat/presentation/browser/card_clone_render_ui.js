import { populateCombatCardFrame } from './combat_card_frame_ui.js';
import { createCombatCloneKeywordPanel } from './combat_copy.js';

export function createHandCardCloneElement(doc, cardId, card, costDisplay, options = {}) {
  const rarity = card.rarity || 'common';

  const clone = doc.createElement('div');
  clone.className = [
    'card-clone',
    `clone-rarity-${rarity}`,
    card.upgraded ? 'clone-upgraded' : '',
  ].filter(Boolean).join(' ');
  populateCombatCardFrame(clone, doc, {
    cardId,
    card,
    canPlay: true,
    displayCost: costDisplay.displayCost,
    anyFree: costDisplay.anyFree,
    totalDisc: costDisplay.totalDisc,
    descriptionUtils: doc?.descriptionUtils || null,
  }, {
    variant: 'hover',
    showHotkey: false,
  });

  const arrow = doc.createElement('div');
  arrow.className = 'card-clone-arrow';
  clone.appendChild(arrow);

  const { link, mechanics, panel } = createCombatCloneKeywordPanel(doc, card, options);
  if (mechanics) clone.appendChild(mechanics);
  if (link) clone.appendChild(link);
  if (panel) clone.appendChild(panel);

  return clone;
}
