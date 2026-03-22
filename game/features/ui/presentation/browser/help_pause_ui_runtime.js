import {
  eventMatchesCode,
  canToggleDeckView,
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
import {
  closePauseMenuRuntime,
  createPauseMenuRuntimeCallbacks,
  saveRunBeforeReturnRuntime,
  swallowEscapeEvent,
} from './help_pause_menu_runtime_ui.js';

export function saveRunBeforeReturn(deps = {}) {
  saveRunBeforeReturnRuntime(deps);
}

export function closePauseMenu(doc, onClose) {
  closePauseMenuRuntime(doc, onClose);
}

export function swallowEscape(event) {
  swallowEscapeEvent(event);
}

export function createPauseMenuCallbacks({ deps = {}, ui }) {
  return createPauseMenuRuntimeCallbacks({ deps, ui });
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

  if (eventMatchesCode(event, keyDeckView) && inGame && !ui.isHelpOpen() && canToggleDeckView(doc)) {
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
      if (gs?.player?.hand?.[idx] && typeof deps.playCard === 'function') {
        deps.playCard(gs.player.hand[idx], idx);
      }
    }
  }

  if (eventMatchesCode(event, keyNextTarget) && inGame && gs?.combat?.active && gs?.combat?.playerTurn) {
    event.preventDefault();
    cycleNextTarget(gs, deps);
  }
}
