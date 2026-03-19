export {
  createDamageRuntime,
  getDocFromDeps,
  getWinFromDeps,
} from './damage_runtime_context.js';
export {
  calculateBaseResolvedDamageValue,
  calculatePotentialDamageValue,
  calculateResolvedDamageValue,
  finalizeResolvedDamageValue,
} from '../domain/damage_value_domain.js';
export {
  handleEnemyDamagePrevention,
  resolveEnemyDamageResult,
  resolveEnemyTargetIndex,
} from './enemy_damage_resolution.js';
export {
  adjustEnemyStatusDuration,
  advancePlayerChain,
  applyLifesteal,
  resolveEnemyStatusTargetIndex,
  resolveIncomingPlayerDamage,
  resolveShieldGainAmount,
  runDealDamageClassHook,
} from './combat_damage_side_effects.js';
