import {
  eventMatchesCode,
  getKeybindingCode,
  isCombatOverlayActive,
  isInGame,
  isVisibleModal,
  resolveGs,
} from './help_pause_ui_helpers.js';
import {
  cycleNextTarget,
  handleEscapeHotkey,
} from './help_pause_hotkeys_runtime_ui.js';

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
    if (handleEscapeHotkey(event, { deps, doc, gs, ui, swallowEscape })) return;
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
