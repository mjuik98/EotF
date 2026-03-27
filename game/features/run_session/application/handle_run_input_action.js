import {
  INPUT_ACTION_CANCEL,
  INPUT_ACTION_CODEX,
  INPUT_ACTION_DECK_VIEW,
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_HELP,
  INPUT_ACTION_PAUSE,
} from '../ports/public_input_capabilities.js';
import { handleCombatInputAction } from '../../combat_session/ports/public_application_capabilities.js';

export function handleRunInputAction(actionId, context = {}) {
  const {
    deps = {},
    doc,
    event,
    gs,
    hotkeyPolicy = {},
    inGame = false,
    onCancel,
    onTargetCycle,
    runHotkeyState = { mode: 'gameplay', activeSurface: null, allowsCombatHotkeys: false },
    ui,
  } = context;

  if ((actionId === INPUT_ACTION_CANCEL || actionId === INPUT_ACTION_PAUSE) && !event?.repeat) {
    return typeof onCancel === 'function'
      ? Boolean(onCancel(actionId, context))
      : false;
  }

  if (!inGame || !ui) return false;

  if (actionId === INPUT_ACTION_HELP) {
    if (runHotkeyState.activeSurface === 'help') {
      event?.preventDefault?.();
      ui.toggleHelp?.(deps);
      return true;
    }
    if (!hotkeyPolicy.help || runHotkeyState.mode === 'modal') return false;
    event?.preventDefault?.();
    ui.toggleHelp?.(deps);
    return true;
  }

  if (actionId === INPUT_ACTION_DECK_VIEW) {
    if (!ui.isHelpOpen?.() && hotkeyPolicy.deckView && context.canToggleDeckView) {
      if (context.isDeckViewVisible) {
        deps.closeDeckView?.();
      } else {
        deps.showDeckView?.();
      }
      return true;
    }
    return false;
  }

  if (actionId === INPUT_ACTION_CODEX) {
    if (runHotkeyState.activeSurface === 'codex') {
      deps.closeCodex?.();
      return true;
    }
    if (!hotkeyPolicy.codex || runHotkeyState.mode === 'modal' || ui.isHelpOpen?.()) {
      return false;
    }
    deps.openCodex?.();
    return true;
  }

  if (runHotkeyState.mode === 'modal' || context.hasBlockingGameplayModal) return false;

  return handleCombatInputAction(actionId, {
    ...context,
    deps,
    doc,
    event,
    gs,
    onTargetCycle,
    runHotkeyState,
  });
}
