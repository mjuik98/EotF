import {
  hasBlockingGameplayModal,
  eventMatchesCode,
  canToggleDeckView,
  getRunHotkeyPolicy,
  getRunHotkeyState,
  getKeybindingCode,
  isCombatOverlayActive,
  isDeckViewVisible,
  isInGame,
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
  const runHotkeyState = getRunHotkeyState(doc, gs);
  const hotkeyPolicy = getRunHotkeyPolicy(runHotkeyState.mode);

  if (eventMatchesCode(event, keyHelp) && inGame) {
    if (runHotkeyState.activeSurface === 'help') {
      event.preventDefault();
      ui.toggleHelp(deps);
      return;
    }
    if (!hotkeyPolicy.help || runHotkeyState.mode === 'modal') return;
    event.preventDefault();
    ui.toggleHelp(deps);
    return;
  }

  if (eventMatchesCode(event, keyDeckView) && inGame && !ui.isHelpOpen() && hotkeyPolicy.deckView && canToggleDeckView(doc, gs)) {
    if (isDeckViewVisible(doc)) {
      if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
    } else if (typeof deps.showDeckView === 'function') {
      deps.showDeckView();
    }
    return;
  }

  if (eventMatchesCode(event, keyCodex) && inGame) {
    if (runHotkeyState.activeSurface === 'codex') {
      if (typeof deps.closeCodex === 'function') deps.closeCodex();
      return;
    }
    if (!hotkeyPolicy.codex || runHotkeyState.mode === 'modal' || ui.isHelpOpen()) {
      return;
    } else if (typeof deps.openCodex === 'function') {
      deps.openCodex();
    }
    return;
  }

  if (runHotkeyState.mode === 'modal' || hasBlockingGameplayModal(doc, gs)) return;

  if (eventMatchesCode(event, keyEchoSkill) && inGame && runHotkeyState.allowsCombatHotkeys) {
    if (typeof deps.useEchoSkill === 'function') deps.useEchoSkill();
  }

  if (eventMatchesCode(event, keyDrawCard) && inGame && runHotkeyState.allowsCombatHotkeys) {
    event.preventDefault();
    if (typeof deps.drawCard === 'function') deps.drawCard();
    deps.buttonFeedback?.triggerDrawButton?.();
  }

  if (eventMatchesCode(event, keyEndTurn) && inGame && runHotkeyState.allowsCombatHotkeys) {
    event.preventDefault();
    if (typeof deps.endPlayerTurn === 'function') deps.endPlayerTurn();
  }

  if (inGame && runHotkeyState.allowsCombatHotkeys) {
    const numKey = event.key === '0' ? 10 : Number.parseInt(event.key, 10);
    if (!Number.isNaN(numKey) && numKey >= 1 && numKey <= 10) {
      const idx = numKey - 1;
      if (gs?.player?.hand?.[idx] && typeof deps.playCard === 'function') {
        deps.playCard(gs.player.hand[idx], idx);
      }
    }
  }

  if (eventMatchesCode(event, keyNextTarget) && inGame && runHotkeyState.allowsCombatHotkeys) {
    event.preventDefault();
    cycleNextTarget(gs, deps);
  }
}
