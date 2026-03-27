import {
  getCurrentInputBindings,
  getRunHotkeyState,
  handleRunSessionHotkeyEvent,
  hasBlockingGameplayModal,
  isCombatOverlayActive,
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
  if (handleRunSessionHotkeyEvent(event, {
    deps,
    doc,
    keybindings: getCurrentInputBindings(),
    onCancel: (_actionId, context) => handleEscapeHotkey(context.event, {
      deps: context.deps,
      doc: context.doc,
      gs: context.gs,
      ui: context.ui,
      swallowEscape,
    }),
    onTargetCycle: (_actionId, context) => {
      cycleNextTarget(context.gs, context.deps);
    },
    ui,
  })) return;

  const inGame = isInGame(gs) || isCombatOverlayActive(doc);
  const runHotkeyState = getRunHotkeyState(doc, gs);
  if (runHotkeyState.mode === 'modal' || hasBlockingGameplayModal(doc, gs)) return;

  if (inGame && runHotkeyState.allowsCombatHotkeys) {
    const numKey = event.key === '0' ? 10 : Number.parseInt(event.key, 10);
    if (!Number.isNaN(numKey) && numKey >= 1 && numKey <= 10) {
      const idx = numKey - 1;
      if (gs?.player?.hand?.[idx] && typeof deps.playCard === 'function') {
        deps.playCard(gs.player.hand[idx], idx);
      }
    }
  }

}
