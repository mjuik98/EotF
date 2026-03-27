import {
  advancePlayerChain,
  applyLifesteal,
  runDealDamageClassHook,
} from './damage_system_runtime_helpers.js';
import { logDealDamageResult } from './damage_system_logging.js';

const DEFAULT_HELPERS = {
  advancePlayerChain,
  applyLifesteal,
  logDealDamageResult,
  runDealDamageClassHook,
};

export function applyResolvedEnemyDamageEffects(host, {
  enemy,
  resolvedTargetIdx,
  result,
  damage,
  noChain,
  deps = {},
  win,
  getBuff,
  source = null,
  base = {},
  helpers = DEFAULT_HELPERS,
} = {}) {
  const totalDamage = result?.totalDamage ?? damage;

  helpers.advancePlayerChain(host, enemy, noChain, deps, win);
  deps.onDealDamageResolved?.({
    damage: totalDamage,
    prevented: false,
    result,
    targetIdx: resolvedTargetIdx,
  });
  helpers.runDealDamageClassHook(host, totalDamage, resolvedTargetIdx, deps, win);
  helpers.logDealDamageResult(host, {
    enemyName: enemy?.name,
    totalDamage,
    source,
    base,
    result,
  });
  helpers.applyLifesteal(host, totalDamage, getBuff);
  host.markDirty?.('enemies');
  deps.updateStatusDisplay?.();

  if (result?.isDead && typeof host?.onEnemyDeath === 'function') {
    host.onEnemyDeath(enemy, resolvedTargetIdx, deps);
  }

  return result?.actualDamage ?? damage;
}
