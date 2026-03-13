import {
  isCombatOverlayActive,
  isInGame,
  isVisibleModal,
} from './help_pause_ui_helpers.js';

export function closeOverlayOnEscape(event, element, onClose, swallowEscape) {
  if (!element) return false;
  swallowEscape(event);
  onClose();
  return true;
}

export function closeVisibleModalById(event, doc, id, onClose, swallowEscape) {
  const el = doc.getElementById(id);
  if (!isVisibleModal(el, doc)) return false;
  swallowEscape(event);
  onClose(el);
  return true;
}

export function cycleNextTarget(gs, deps) {
  const enemies = gs?.combat?.enemies || [];
  const aliveIndices = enemies
    .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx >= 0);

  if (aliveIndices.length <= 1) return;

  const current = aliveIndices.indexOf(gs._selectedTarget ?? -1);
  gs._selectedTarget = aliveIndices[(current + 1) % aliveIndices.length];
  if (typeof gs?.addLog === 'function') {
    gs.addLog(`🎯 대상: ${enemies[gs._selectedTarget].name}`, 'system');
  }
  if (typeof deps.renderCombatEnemies === 'function') {
    deps.renderCombatEnemies();
  }
}

export function handleEscapeHotkey(event, { deps, doc, gs, ui, swallowEscape }) {
  const pauseMenu = doc.getElementById('pauseMenu');
  if (isVisibleModal(pauseMenu, doc)) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  if (closeVisibleModalById(event, doc, 'fullMapOverlay', (overlay) => {
    if (typeof overlay._closeFullMap === 'function') overlay._closeFullMap();
    else overlay.remove();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'battleChronicleOverlay', () => {
    if (typeof deps.closeBattleChronicle === 'function') deps.closeBattleChronicle();
  }, swallowEscape)) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('returnTitleConfirm'), () => {
    doc.getElementById('returnTitleConfirm')?.remove();
  }, swallowEscape)) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('abandonConfirm'), () => {
    doc.getElementById('abandonConfirm')?.remove();
  }, swallowEscape)) {
    return true;
  }

  const helpMenu = doc.getElementById('helpMenu');
  if (helpMenu && helpMenu.style.display !== 'none') {
    swallowEscape(event);
    ui.toggleHelp(deps);
    return true;
  }

  if (closeVisibleModalById(event, doc, 'deckViewModal', () => {
    if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'codexModal', () => {
    if (typeof deps.closeCodex === 'function') deps.closeCodex();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'runSettingsModal', () => {
    if (typeof deps.closeRunSettings === 'function') deps.closeRunSettings();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'settingsModal', () => {
    if (typeof deps.closeSettings === 'function') deps.closeSettings();
  }, swallowEscape)) {
    return true;
  }

  const inGame = isInGame(gs) || isCombatOverlayActive(doc);
  const isTitle = gs?.currentScreen === 'title';
  if (inGame && !ui.isHelpOpen()) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  return isTitle;
}
