import {
  eventMatchesCode,
  getKeybindingCode,
  isCombatOverlayActive,
  isInGame,
  isVisibleModal,
  resolveGs,
} from './help_pause_ui_helpers.js';

export function saveRunBeforeReturn(deps = {}) {
  const gs = resolveGs(deps);
  if (!gs) return;

  const saveSystem = globalThis.GAME?.Modules?.SaveSystem ?? globalThis.SaveSystem;
  if (saveSystem && typeof saveSystem.saveRun === 'function') {
    saveSystem.saveRun({ gs, isGameStarted: () => true });
    return;
  }

  if (typeof deps.saveRun === 'function') {
    deps.saveRun();
  }
}

export function closePauseMenu(doc, onClose) {
  doc?.getElementById?.('pauseMenu')?.remove();
  if (typeof onClose === 'function') onClose();
}

export function swallowEscape(event) {
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }
}

export function createPauseMenuCallbacks({ deps = {}, ui }) {
  return {
    onResume: () => ui.togglePause(deps),
    onOpenDeck: () => {
      if (typeof deps.showDeckView === 'function') deps.showDeckView();
      ui.togglePause(deps);
    },
    onOpenCodex: () => {
      if (typeof deps.openCodex === 'function') deps.openCodex();
      ui.togglePause(deps);
    },
    onOpenSettings: () => {
      ui.togglePause(deps);
      if (typeof deps.openSettings === 'function') deps.openSettings();
      else globalThis.GAME?.API?.openSettings?.();
    },
    onOpenHelp: () => {
      ui.toggleHelp(deps);
      ui.togglePause(deps);
    },
    onAbandon: () => ui.abandonRun(deps),
    onReturnToTitle: () => ui.confirmReturnToTitle(deps),
    onQuitGame: () => {
      if (typeof deps.quitGame === 'function') deps.quitGame();
    },
    onSetMasterVolume: (value) => {
      if (typeof deps.setMasterVolume === 'function') deps.setMasterVolume(value);
    },
    onSetSfxVolume: (value) => {
      if (typeof deps.setSfxVolume === 'function') deps.setSfxVolume(value);
    },
    onSetAmbientVolume: (value) => {
      if (typeof deps.setAmbientVolume === 'function') deps.setAmbientVolume(value);
    },
  };
}

function closeOverlayOnEscape(event, element, onClose) {
  if (!element) return false;
  swallowEscape(event);
  onClose();
  return true;
}

function closeVisibleModalById(event, doc, id, onClose) {
  const el = doc.getElementById(id);
  if (!isVisibleModal(el, doc)) return false;
  swallowEscape(event);
  onClose(el);
  return true;
}

function cycleNextTarget(gs, deps) {
  const enemies = gs?.combat?.enemies || [];
  const aliveIndices = enemies
    .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx >= 0);

  if (aliveIndices.length <= 1) return;

  const cur = aliveIndices.indexOf(gs._selectedTarget ?? -1);
  gs._selectedTarget = aliveIndices[(cur + 1) % aliveIndices.length];
  if (typeof gs?.addLog === 'function') {
    gs.addLog(`🎯 대상: ${enemies[gs._selectedTarget].name}`, 'system');
  }
  if (typeof deps.renderCombatEnemies === 'function') {
    deps.renderCombatEnemies();
  }
}

function handleEscapeHotkey(event, { deps, doc, gs, ui }) {
  const pauseMenu = doc.getElementById('pauseMenu');
  if (isVisibleModal(pauseMenu, doc)) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  if (closeVisibleModalById(event, doc, 'fullMapOverlay', (overlay) => {
    if (typeof overlay._closeFullMap === 'function') overlay._closeFullMap();
    else overlay.remove();
  })) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'battleChronicleOverlay', () => {
    if (typeof deps.closeBattleChronicle === 'function') deps.closeBattleChronicle();
    else globalThis.GAME?.API?.closeBattleChronicle?.();
  })) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('returnTitleConfirm'), () => {
    doc.getElementById('returnTitleConfirm')?.remove();
  })) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('abandonConfirm'), () => {
    doc.getElementById('abandonConfirm')?.remove();
  })) {
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
  })) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'codexModal', () => {
    if (typeof deps.closeCodex === 'function') deps.closeCodex();
  })) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'runSettingsModal', () => {
    if (typeof deps.closeRunSettings === 'function') deps.closeRunSettings();
  })) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'settingsModal', () => {
    if (typeof deps.closeSettings === 'function') deps.closeSettings();
    else globalThis.GAME?.API?.closeSettings?.();
  })) {
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

export function handleGlobalHotkey(event, { deps = {}, doc, ui }) {
  const gs = resolveGs(deps);
  const keyPause = getKeybindingCode('pause', 'Escape');
  const keyHelp = getKeybindingCode('help', 'Slash');
  const keyDeckView = getKeybindingCode('deckView', 'KeyD');
  const keyCodex = getKeybindingCode('codex', 'KeyC');
  const keyEchoSkill = getKeybindingCode('echoSkill', 'KeyE');
  const keyDrawCard = getKeybindingCode('drawCard', 'KeyQ');
  const keyEndTurn = getKeybindingCode('endTurn', 'Enter');
  const keyNextTarget = getKeybindingCode('nextTarget', 'Tab');
  const isEscapeKey = event.key === 'Escape' || event.key === 'Esc';
  const isPauseKey = eventMatchesCode(event, keyPause);
  const isSettingsRebinding = Boolean(doc.querySelector?.('.settings-keybind-btn.listening'));

  if (isSettingsRebinding) return;

  if (isEscapeKey || isPauseKey) {
    if (event.repeat) return;
    if (handleEscapeHotkey(event, { deps, doc, gs, ui })) return;
  }

  const inGame = isInGame(gs) || isCombatOverlayActive(doc);

  if (eventMatchesCode(event, keyHelp) && inGame) {
    event.preventDefault();
    ui.toggleHelp(deps);
  }

  if (eventMatchesCode(event, keyDeckView) && inGame && !ui.isHelpOpen()) {
    const modal = doc.getElementById('deckViewModal');
    if (modal?.classList?.contains('active')) {
      if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
    } else if (typeof deps.showDeckView === 'function') {
      deps.showDeckView();
    }
  }

  if (eventMatchesCode(event, keyCodex) && inGame && !ui.isHelpOpen()) {
    const modal = doc.getElementById('codexModal');
    if (isVisibleModal(modal, doc)) {
      if (typeof deps.closeCodex === 'function') deps.closeCodex();
    } else if (typeof deps.openCodex === 'function') {
      deps.openCodex();
    } else {
      globalThis.GAME?.API?.openCodex?.();
    }
  }

  if (eventMatchesCode(event, keyEchoSkill) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
  }

  if (eventMatchesCode(event, keyDrawCard) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    event.preventDefault();
    if (typeof deps.drawCard === 'function') deps.drawCard();
    deps.buttonFeedback?.triggerDrawButton?.();
  }

  if (eventMatchesCode(event, keyEndTurn) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    event.preventDefault();
    if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
  }

  if (inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    const numKey = event.key === '0' ? 10 : Number.parseInt(event.key, 10);
    if (!Number.isNaN(numKey) && numKey >= 1 && numKey <= 10) {
      const idx = numKey - 1;
      if (gs?.player?.hand?.[idx] && typeof gs?.playCard === 'function') {
        gs.playCard(gs.player.hand[idx], idx);
      }
    }
  }

  if (eventMatchesCode(event, keyNextTarget) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    event.preventDefault();
    cycleNextTarget(gs, deps);
  }
}
