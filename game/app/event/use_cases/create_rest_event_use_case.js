import { EventManager } from '../../../systems/event_manager.js';

export function createRestEventUseCase({
  gs,
  data,
  runRules,
  showCardDiscard,
} = {}) {
  if (!gs || !data || !runRules) return null;
  return EventManager.createRestEvent(gs, data, runRules, {
    showCardDiscardFn: (state, isBurn) => showCardDiscard?.(state, isBurn),
  });
}
