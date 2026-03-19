import { createRestEventAction } from './event_manager_actions.js';

export function createRestEventUseCase({
  gs,
  data,
  runRules,
  showCardDiscard,
} = {}) {
  if (!gs || !data || !runRules) return null;
  return createRestEventAction(gs, data, runRules, {
    showCardDiscardFn: (state, isBurn) => showCardDiscard?.(state, isBurn),
  });
}
