import { populateCombatCardFrame } from './combat_card_frame_ui.js';
import { createCombatCloneKeywordPanel } from './combat_keyword_copy.js';

export const DEFAULT_HOVER_KEYWORD_LAYOUT = Object.freeze({
  panelWidth: 176,
  panelGap: 12,
  panelEstimatedHeight: 128,
  connectorLength: 22,
  connectorThickness: 2,
  bottomOffset: 2,
});

function setStyleVar(element, name, value) {
  if (!element?.style || !name) return;
  if (typeof element.style.setProperty === 'function') {
    element.style.setProperty(name, value);
    return;
  }
  element.style[name] = value;
}

export function resolveHoverKeywordLayoutOptions(options = {}) {
  const source = options?.hoverKeywordLayout || options;
  const fallback = DEFAULT_HOVER_KEYWORD_LAYOUT;

  return {
    panelWidth: Number(source?.panelWidth) > 0 ? Number(source.panelWidth) : fallback.panelWidth,
    panelGap: Number(source?.panelGap) > 0 ? Number(source.panelGap) : fallback.panelGap,
    panelEstimatedHeight: Number(source?.panelEstimatedHeight) > 0
      ? Number(source.panelEstimatedHeight)
      : fallback.panelEstimatedHeight,
    connectorLength: Number(source?.connectorLength) > 0 ? Number(source.connectorLength) : fallback.connectorLength,
    connectorThickness: Number(source?.connectorThickness) > 0
      ? Number(source.connectorThickness)
      : fallback.connectorThickness,
    bottomOffset: Number(source?.bottomOffset) >= 0 ? Number(source.bottomOffset) : fallback.bottomOffset,
  };
}

function applyHoverKeywordLayoutVars(clone, layout) {
  setStyleVar(clone, '--hover-keyword-panel-width', `${layout.panelWidth}px`);
  setStyleVar(clone, '--hover-keyword-panel-gap', `${layout.panelGap}px`);
  setStyleVar(clone, '--hover-keyword-panel-height', `${layout.panelEstimatedHeight}px`);
  setStyleVar(clone, '--hover-keyword-connector-length', `${layout.connectorLength}px`);
  setStyleVar(clone, '--hover-keyword-connector-thickness', `${layout.connectorThickness}px`);
  setStyleVar(clone, '--hover-keyword-bottom-offset', `${layout.bottomOffset}px`);
}

export function createHandCardCloneElement(doc, cardId, card, costDisplay, options = {}) {
  const rarity = card.rarity || 'common';
  const hoverKeywordLayout = resolveHoverKeywordLayoutOptions(options);

  const clone = doc.createElement('div');
  clone.className = [
    'card-clone',
    `clone-rarity-${rarity}`,
    card.upgraded ? 'clone-upgraded' : '',
  ].filter(Boolean).join(' ');
  applyHoverKeywordLayoutVars(clone, hoverKeywordLayout);
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

  const { link, mechanics, panel } = createCombatCloneKeywordPanel(doc, card);
  if (mechanics) clone.appendChild(mechanics);
  if (link) clone.appendChild(link);
  if (panel) clone.appendChild(panel);

  return clone;
}
