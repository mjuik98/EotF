import { buildRunBootActions } from '../../application/build_run_boot_actions.js';
import { bindFinalizeRunOutcome } from '../../application/bind_run_outcome_action.js';
import { buildRunReturnRuntimeActions } from '../../application/build_run_return_runtime_actions.js';
import { finalizeRunOutcome } from '../../application/run_rules.js';
import { createRunCanvasBindings } from '../../platform/browser/create_run_canvas_bindings.js';
import { registerRunEntryBindings as registerRunEntryBrowserBindings } from '../../platform/browser/register_run_entry_bindings.js';

export function createRunRuntimeCapabilities() {
  return {
    buildBootActions: buildRunBootPublicActions,
    buildReturnActions: buildRunReturnRuntimePublicActions,
  };
}

export function registerRunEntryBindings(options = {}) {
  return registerRunEntryBrowserBindings(options);
}

export function buildRunBootPublicActions(fns) {
  return buildRunBootActions(fns);
}

export function buildRunReturnRuntimePublicActions() {
  return buildRunReturnRuntimeActions();
}

export function createFinalizeRunOutcomeAction(saveSystem, getGameState = null) {
  return (kind = 'defeat', options = {}, extraDeps = {}) => bindFinalizeRunOutcome(
    finalizeRunOutcome,
    saveSystem,
  )(kind, options, { getGameState, ...extraDeps });
}

export { createRunCanvasBindings };
