import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import {
  handleBossPhaseShift,
  handleEnemyEffect,
  processEnemyStatusTicks,
} from '../domain/enemy_turn_domain.js';
import { processPlayerStatusTicks } from '../domain/player_status_tick_domain.js';

export function processEnemyStatusTicksAction({
  gs,
  renderCombatEnemies,
  processEnemyStatusTicksFn = processEnemyStatusTicks,
} = {}) {
  if (!gs) return [];
  const events = processEnemyStatusTicksFn(gs);
  renderCombatEnemies?.();
  return events;
}

export function processPlayerStatusTicksAction({
  gs,
  shuffleArray,
  syncCombatEnergy,
  updateStatusDisplay,
  updateUI,
  processPlayerStatusTicksFn = processPlayerStatusTicks,
} = {}) {
  const result = processPlayerStatusTicksFn(gs, {
    shuffleArrayFn: shuffleArray,
  });
  syncCombatEnergy?.();
  updateStatusDisplay?.();
  updateUI?.();
  return result.alive;
}

export function handleBossPhaseShiftAction({
  gs,
  enemy,
  index,
  presentBossPhaseShift,
  handleBossPhaseShiftFn = handleBossPhaseShift,
} = {}) {
  const result = handleBossPhaseShiftFn(gs, enemy);
  presentBossPhaseShift?.(enemy, index);
  return result;
}

export function handleEnemyEffectAction({
  gs,
  data,
  effect,
  enemy,
  dispatchUiAction,
  getCombatRegionId = resolveActiveRegionId,
  handleEnemyEffectFn = handleEnemyEffect,
} = {}) {
  const regionId = getCombatRegionId(gs);
  const result = handleEnemyEffectFn(effect, gs, enemy, { regionId, data });
  if (result?.uiAction) dispatchUiAction?.(result);
  return result;
}
