import {
  INPUT_ACTION_CANCEL,
  INPUT_ACTION_CODEX,
  INPUT_ACTION_DECK_VIEW,
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_HELP,
  INPUT_ACTION_PAUSE,
  INPUT_ACTION_TARGET_CYCLE,
} from '../ports/public_input_capabilities.js';

function fallbackCombatInputAction(actionId, context = {}) {
  const {
    deps = {},
    event,
    gs,
    onTargetCycle,
    runHotkeyState = { allowsCombatHotkeys: false },
  } = context;

  if (!runHotkeyState.allowsCombatHotkeys) return false;

  if (actionId === INPUT_ACTION_ECHO_SKILL) {
    deps.useEchoSkill?.();
    return true;
  }

  if (actionId === INPUT_ACTION_DRAW_CARD) {
    event?.preventDefault?.();
    deps.drawCard?.();
    deps.buttonFeedback?.triggerDrawButton?.();
    return true;
  }

  if (actionId === INPUT_ACTION_END_TURN) {
    event?.preventDefault?.();
    deps.endPlayerTurn?.();
    return true;
  }

  if (actionId === INPUT_ACTION_TARGET_CYCLE) {
    event?.preventDefault?.();
    if (typeof onTargetCycle === 'function') {
      onTargetCycle(actionId, { ...context, deps, event, gs });
      return true;
    }
  }

  return false;
}

function resolveCombatInputActionHandler(context = {}, deps = {}) {
  if (typeof context.handleCombatInputAction === 'function') {
    return context.handleCombatInputAction;
  }
  if (typeof deps.handleCombatInputAction === 'function') {
    return deps.handleCombatInputAction;
  }
  return fallbackCombatInputAction;
}

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

  const handleCombatInputAction = resolveCombatInputActionHandler(context, deps);
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
